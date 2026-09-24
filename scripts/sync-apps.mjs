import { createHash } from "node:crypto";
import { mkdir, rename, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const snapshotDir = path.join(rootDir, "src", "data", "apps-snapshot");
const tmpDir = path.join(rootDir, "src", "data", "apps-snapshot.tmp");
const backupDir = path.join(rootDir, "src", "data", "apps-snapshot.backup");

const catalogUrl = "https://queesia.com/api/obtener_datos.php?all=1&limit=5000&page=1";
const schemaVersion = 1;
const requestTimeoutMs = 15000;
const batchSize = 50;
const maxConcurrency = 5;
const maxAttempts = 3;
const retryBackoffMs = 600;

const appFields = [
  "id",
  "name",
  "url",
  "short_description",
  "category",
  "main_functionality",
  "tags",
  "logo_filename",
  "what_is",
  "purpose",
  "use_cases",
  "main_advantages",
  "long_description",
  "release_date",
  "developer",
  "main_model",
  "pricing_plans",
  "license",
  "security_privacy",
  "integration",
];

const newsFields = ["success_type", "title", "description", "url"];
const sourceFields = ["source_url"];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function valueOrNull(value) {
  return value === undefined ? null : value;
}

function pickFields(source, fields) {
  return Object.fromEntries(fields.map((field) => [field, valueOrNull(source?.[field])]));
}

function normalizeApp(app) {
  const normalized = pickFields(app, appFields);
  normalized.id = String(normalized.id);
  normalized.tags = normalized.tags ?? [];
  return normalized;
}

function normalizeNews(news) {
  return Array.isArray(news) ? news.map((item) => pickFields(item, newsFields)) : [];
}

function normalizeSources(sources) {
  return Array.isArray(sources) ? sources.map((item) => pickFields(item, sourceFields)) : [];
}

function hashContent(content) {
  return createHash("sha256").update(content).digest("hex");
}

async function fetchJson(url, label) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), requestTimeoutMs);

  try {
    const response = await fetch(url, { signal: controller.signal });

    if (!response.ok) {
      throw new Error(`${label}: HTTP ${response.status}`);
    }

    try {
      return await response.json();
    } catch (error) {
      throw new Error(`${label}: JSON invalido: ${error.message}`);
    }
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchCatalogIds() {
  const data = await fetchJson(catalogUrl, "catalogo");

  if (!data?.success || !Array.isArray(data.tools)) {
    throw new Error("El catalogo no devolvio success=true con tools[].");
  }

  const catalogStats = {
    totalReceived: data.tools.length,
    missingId: 0,
    missingName: 0,
    duplicateIds: [],
  };

  const selectedIds = [];
  const seenIds = new Set();
  const duplicateIds = new Set();

  for (const app of data.tools) {
    const id = String(app?.id ?? "").trim();
    const name = String(app?.name ?? "").trim();

    if (!id) {
      catalogStats.missingId += 1;
      continue;
    }

    if (!name) {
      catalogStats.missingName += 1;
    }

    if (seenIds.has(id)) {
      duplicateIds.add(id);
      continue;
    }

    seenIds.add(id);
    selectedIds.push(id);
  }

  catalogStats.duplicateIds = Array.from(duplicateIds);

  if (catalogStats.duplicateIds.length > 0) {
    throw new Error(`El catalogo contiene IDs duplicados: ${catalogStats.duplicateIds.join(", ")}`);
  }

  if (selectedIds.length === 0) {
    throw new Error("El catalogo no contiene IDs validos.");
  }

  return { selectedIds, catalogStats };
}

async function fetchApp(id) {
  const url = `https://queesia.com/api/obtener_app.php?id=${encodeURIComponent(id)}`;
  const payload = await fetchJson(url, `app ${id}`);

  if (!payload?.success) {
    throw new Error("La API no devolvio success=true.");
  }

  if (!payload.app) {
    throw new Error("La respuesta no contiene app.");
  }

  const appId = String(payload.app.id ?? "").trim();
  const appName = String(payload.app.name ?? "").trim();

  if (!appId) {
    throw new Error("La app no contiene id.");
  }

  if (!appName) {
    throw new Error("La app no contiene name.");
  }

  if (appId !== id) {
    throw new Error(`ID devuelto ${appId} no corresponde al solicitado ${id}.`);
  }

  return {
    app: normalizeApp(payload.app),
    news: normalizeNews(payload.news),
    sources: normalizeSources(payload.sources),
  };
}

async function fetchAppWithRetries(id) {
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const detail = await fetchApp(id);

      return {
        id,
        detail,
        attempts: attempt,
        retries: attempt - 1,
      };
    } catch (error) {
      lastError = error;

      if (attempt < maxAttempts) {
        await sleep(retryBackoffMs * attempt);
      }
    }
  }

  throw new Error(`app ${id}: fallo tras ${maxAttempts} intentos. ${lastError.message}`);
}

async function runPool(items, worker, concurrency) {
  const results = new Array(items.length);
  const failures = [];
  let nextIndex = 0;

  async function runWorker() {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;

      try {
        results[currentIndex] = await worker(items[currentIndex], currentIndex);
      } catch (error) {
        failures.push({
          item: items[currentIndex],
          index: currentIndex,
          error,
        });
      }
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    () => runWorker()
  );

  await Promise.all(workers);

  return { results, failures };
}

function chunkEntries(entries, size) {
  const chunks = [];

  for (let index = 0; index < entries.length; index += size) {
    chunks.push(entries.slice(index, index + size));
  }

  return chunks;
}

function shouldLogProgress(completedCount, totalCount, retries) {
  return retries > 0 || completedCount <= 10 || completedCount % 50 === 0 || completedCount === totalCount;
}

async function replaceSnapshotAtomically() {
  await rm(backupDir, { recursive: true, force: true });

  let movedCurrentToBackup = false;

  try {
    await rename(snapshotDir, backupDir);
    movedCurrentToBackup = true;
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }

  try {
    await rename(tmpDir, snapshotDir);
    await rm(backupDir, { recursive: true, force: true });
  } catch (error) {
    if (movedCurrentToBackup) {
      await rm(snapshotDir, { recursive: true, force: true });
      await rename(backupDir, snapshotDir);
    }

    throw error;
  }
}

async function getSnapshotSize(files) {
  let total = 0;

  for (const file of files) {
    const info = await stat(path.join(tmpDir, file));
    total += info.size;
  }

  return total;
}

async function main() {
  const startedAt = Date.now();

  console.log("Consultando catalogo completo una vez...");
  const { selectedIds, catalogStats } = await fetchCatalogIds();
  console.log(`Total recibido del catalogo: ${catalogStats.totalReceived}`);
  console.log(`Registros sin id: ${catalogStats.missingId}`);
  console.log(`Registros sin name: ${catalogStats.missingName}`);
  console.log(`IDs duplicados: ${catalogStats.duplicateIds.length}`);
  console.log(`Usando ${selectedIds.length} IDs validos unicos del catalogo.`);
  console.log(`Sincronizando ${selectedIds.length} apps con concurrencia maxima ${maxConcurrency}...`);

  const completed = [];
  let totalRetries = 0;

  const { results, failures } = await runPool(
    selectedIds,
    async (id, index) => {
      const result = await fetchAppWithRetries(id);
      totalRetries += result.retries;
      completed.push(result);

      if (shouldLogProgress(completed.length, selectedIds.length, result.retries)) {
        console.log(
          `[${completed.length}/${selectedIds.length}] ${id} - ${result.detail.app.name}` +
            (result.retries > 0 ? ` (${result.retries} reintento${result.retries === 1 ? "" : "s"})` : "")
        );
      }

      return {
        index,
        ...result,
      };
    },
    maxConcurrency
  );

  if (failures.length > 0) {
    for (const failure of failures) {
      console.error(`Fallo ${failure.item}: ${failure.error.message}`);
    }

    throw new Error(`${failures.length} apps fallaron; no se reemplaza el snapshot valido.`);
  }

  const orderedResults = results.filter(Boolean).sort((a, b) => a.index - b.index);

  if (orderedResults.length !== selectedIds.length) {
    throw new Error("La sincronizacion no devolvio la cantidad esperada de apps.");
  }

  const entries = orderedResults.map((result) => [result.id, result.detail]);
  const batches = [];
  const writtenFiles = [];

  await rm(tmpDir, { recursive: true, force: true });
  await mkdir(tmpDir, { recursive: true });

  for (const [batchIndex, batchEntries] of chunkEntries(entries, batchSize).entries()) {
    const batchFileName = `apps-${String(batchIndex + 1).padStart(4, "0")}.json`;
    const batch = {
      schemaVersion,
      apps: Object.fromEntries(batchEntries),
    };
    const batchContent = `${JSON.stringify(batch, null, 2)}\n`;
    const batchHash = hashContent(batchContent);

    await writeFile(path.join(tmpDir, batchFileName), batchContent, "utf8");
    writtenFiles.push(batchFileName);
    batches.push({
      file: batchFileName,
      count: batchEntries.length,
      sha256: batchHash,
    });
  }

  const manifest = {
    schemaVersion,
    generatedAt: new Date().toISOString(),
    count: entries.length,
    selection: {
      source: catalogUrl,
      strategy: "all valid unique ids in API order",
      catalogStats,
    },
    batches,
  };

  if (manifest.count !== selectedIds.length) {
    throw new Error("El snapshot no contiene todas las apps validas seleccionadas.");
  }

  const manifestContent = `${JSON.stringify(manifest, null, 2)}\n`;
  await writeFile(path.join(tmpDir, "manifest.json"), manifestContent, "utf8");
  writtenFiles.push("manifest.json");

  const snapshotBytes = await getSnapshotSize(writtenFiles);

  await replaceSnapshotAtomically();

  const elapsedSeconds = ((Date.now() - startedAt) / 1000).toFixed(2);

  console.log("Snapshot validado.");
  console.log(`${manifest.count} apps guardadas.`);
  console.log(`${batches.length} batches generados.`);
  console.log(`Apps solicitadas: ${selectedIds.length}`);
  console.log(`Apps correctas: ${orderedResults.length}`);
  console.log("Apps fallidas: 0");
  console.log(`Reintentos totales: ${totalRetries}`);
  console.log(`Tamano snapshot: ${snapshotBytes} bytes`);
  console.log(`Tiempo total sync: ${elapsedSeconds}s`);
}

main().catch(async (error) => {
  await rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  console.error(`Error sincronizando snapshot: ${error.message}`);
  process.exitCode = 1;
});
