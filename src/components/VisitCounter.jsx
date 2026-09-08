// src/components/VisitCounter.jsx
import { useEffect, useState } from "react";
import { trackHomeVisit, listenHomeVisits } from "../scripts/trackHomeVisit";

export default function VisitCounter() {
  const [visitas, setVisitas] = useState(null);

  useEffect(() => {
    trackHomeVisit();                    // suma +1 (1 vez al día por navegador)
    const off = listenHomeVisits(setVisitas); // escucha cambios en /metrics/home
    return () => off && off();
  }, []);

  const fmt = (n) => new Intl.NumberFormat("es-MX").format(n ?? 0);

  return (
    <p className="text-sm text-gray-600 mt-2">
      Visitas: {visitas == null ? "..." : fmt(visitas)}
    </p>
  );
}
