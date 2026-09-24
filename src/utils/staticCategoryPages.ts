import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { App } from "../types";

export type CategoryManifestEntry = {
  name: string;
  slug: string;
  aliases: string[];
};

type SnapshotApp = Omit<App, "id" | "tags"> & {
  id: string | number;
  tags: App["tags"] | string | null;
};

type SnapshotEntry = {
  app?: SnapshotApp | null;
};

type SnapshotManifest = {
  schemaVersion?: number;
  count?: number;
  batches?: Array<{
    file?: string;
    count?: number;
    sha256?: string;
  }>;
};

type SnapshotBatch = {
  schemaVersion?: number;
  apps?: Record<string, SnapshotEntry>;
};

export type CategoryPageProps = {
  category: CategoryManifestEntry;
  apps: App[];
};

const SNAPSHOT_SCHEMA_VERSION = 1;

export function cleanText(value?: string | number | null) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function normalizeTags(tags: SnapshotApp["tags"]) {
  if (!tags) return [];

  const rawTags = Array.isArray(tags) ? tags : String(tags).split(/[,\n;#]+/);

  return rawTags
    .map((tag) => cleanText(String(tag).replace(/^#/, "").replace(/,+$/g, "")))
    .filter(Boolean)
    .slice(0, 6);
}

function toApp(app: SnapshotApp): App {
  return {
    ...app,
    id: Number(app.id),
    name: cleanText(app.name),
    category: cleanText(app.category),
    tags: normalizeTags(app.tags),
  } as App;
}

async function readJsonFile<T>(filePath: string, label: string) {
  let content = "";

  try {
    content = await readFile(filePath, "utf8");
  } catch (error) {
    throw new Error(`No se pudo leer ${label}: ${(error as Error).message}`);
  }

  try {
    return {
      content,
      data: JSON.parse(content) as T,
    };
  } catch (error) {
    throw new Error(`${label} no contiene JSON valido: ${(error as Error).message}`);
  }
}

function getContentHash(content: string) {
  return createHash("sha256").update(content).digest("hex");
}

export async function loadSnapshotApps() {
  const snapshotBaseDir = path.join(process.cwd(), "src", "data", "apps-snapshot");
  const manifestPath = path.join(snapshotBaseDir, "manifest.json");
  const { data: manifest } = await readJsonFile<SnapshotManifest>(
    manifestPath,
    "apps-snapshot/manifest.json"
  );

  if (manifest.schemaVersion !== SNAPSHOT_SCHEMA_VERSION) {
    throw new Error(`Snapshot invalido: schemaVersion ${manifest.schemaVersion}.`);
  }

  if (!Array.isArray(manifest.batches) || manifest.batches.length === 0) {
    throw new Error("Snapshot invalido: manifest sin batches.");
  }

  const apps: App[] = [];
  const seenIds = new Set<string>();

  for (const batchRef of manifest.batches) {
    if (!batchRef.file) {
      throw new Error("Snapshot invalido: batch sin archivo.");
    }

    const batchPath = path.join(snapshotBaseDir, batchRef.file);
    const { content, data: batch } = await readJsonFile<SnapshotBatch>(
      batchPath,
      `apps-snapshot/${batchRef.file}`
    );

    if (batchRef.sha256 && getContentHash(content) !== batchRef.sha256) {
      throw new Error(`Snapshot invalido: sha256 no coincide para ${batchRef.file}.`);
    }

    if (batch.schemaVersion !== SNAPSHOT_SCHEMA_VERSION) {
      throw new Error(`Snapshot invalido: schemaVersion no compatible en ${batchRef.file}.`);
    }

    if (!batch.apps || typeof batch.apps !== "object" || Array.isArray(batch.apps)) {
      throw new Error(`Snapshot invalido: ${batchRef.file} no contiene apps validas.`);
    }

    const batchEntries = Object.entries(batch.apps);

    if (typeof batchRef.count === "number" && batchEntries.length !== batchRef.count) {
      throw new Error(`Snapshot invalido: count no coincide en ${batchRef.file}.`);
    }

    for (const [id, detail] of batchEntries) {
      const app = detail?.app;
      const appId = cleanText(app?.id);

      if (!app || !appId) {
        throw new Error(`Snapshot invalido: app o id ausente para ${id}.`);
      }

      if (appId !== id) {
        throw new Error(`Snapshot invalido: id interno ${appId} no coincide con clave ${id}.`);
      }

      if (seenIds.has(id)) {
        throw new Error(`Snapshot invalido: id duplicado ${id}.`);
      }

      seenIds.add(id);
      apps.push(toApp(app));
    }
  }

  if (typeof manifest.count === "number" && apps.length !== manifest.count) {
    throw new Error("Snapshot invalido: count total no coincide.");
  }

  return apps;
}

export async function loadCategoriesManifest() {
  const manifestPath = path.join(process.cwd(), "src", "data", "categories-manifest.json");
  const { data } = await readJsonFile<CategoryManifestEntry[]>(
    manifestPath,
    "categories-manifest.json"
  );

  if (!Array.isArray(data)) {
    throw new Error("categories-manifest.json debe ser un array.");
  }

  return data;
}

function findDuplicates(values: string[]) {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const value of values) {
    if (seen.has(value)) {
      duplicates.add(value);
    }

    seen.add(value);
  }

  return Array.from(duplicates).sort((a, b) => a.localeCompare(b, "es"));
}

export function validateCategoryAssignments(categories: CategoryManifestEntry[], apps: App[]) {
  const duplicateSlugs = findDuplicates(categories.map((category) => category.slug));
  const duplicateNames = findDuplicates(categories.map((category) => category.name));

  if (duplicateSlugs.length > 0) {
    throw new Error(`Manifest de categorias invalido: slugs duplicados: ${duplicateSlugs.join(", ")}`);
  }

  if (duplicateNames.length > 0) {
    throw new Error(`Manifest de categorias invalido: names duplicados: ${duplicateNames.join(", ")}`);
  }

  const manifestNames = new Set(categories.map((category) => category.name));
  const snapshotNames = new Set(apps.map((app) => cleanText(app.category)).filter(Boolean));

  const missingInSnapshot = categories
    .map((category) => category.name)
    .filter((name) => !snapshotNames.has(name))
    .sort((a, b) => a.localeCompare(b, "es"));

  if (missingInSnapshot.length > 0) {
    throw new Error(
      `Manifest de categorias invalido: categorias sin correspondencia en snapshot: ${missingInSnapshot.join(", ")}`
    );
  }

  const missingInManifest = Array.from(snapshotNames)
    .filter((name) => !manifestNames.has(name))
    .sort((a, b) => a.localeCompare(b, "es"));

  if (missingInManifest.length > 0) {
    throw new Error(
      `Snapshot invalido: categorias no representadas en manifest: ${missingInManifest.join(", ")}`
    );
  }

  const invalidAssignments = apps
    .map((app) => {
      const categoryName = cleanText(app.category);
      const matches = categories.filter((category) => category.name === categoryName);

      return {
        id: app.id,
        name: app.name,
        categoryName,
        matchCount: matches.length,
      };
    })
    .filter((assignment) => assignment.matchCount !== 1);

  if (invalidAssignments.length > 0) {
    const sample = invalidAssignments
      .slice(0, 10)
      .map(
        (assignment) =>
          `${assignment.id} (${assignment.name}) categoria="${assignment.categoryName}" coincidencias=${assignment.matchCount}`
      )
      .join("; ");

    throw new Error(
      `Snapshot invalido: apps asignadas a cero o mas de una categoria (${invalidAssignments.length}). ${sample}`
    );
  }
}

export function getCategoryPageProps(categories: CategoryManifestEntry[], apps: App[]) {
  validateCategoryAssignments(categories, apps);

  return categories.map((category) => ({
    category,
    apps: apps.filter((app) => cleanText(app.category) === category.name),
  }));
}
