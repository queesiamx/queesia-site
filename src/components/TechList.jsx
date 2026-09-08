// src/components/TechList.jsx
import { Calendar, User, Cpu, BadgeCheck } from "lucide-react";

function Row({ Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="w-4 h-4 mt-1 text-primary" />
      <div>
        <dt className="text-default-soft">{label}</dt>
        <dd className="text-sm">{value || "—"}</dd>
      </div>
    </div>
  );
}

export default function TechList({ release_date, developer, main_model, license }) {
  return (
    <dl className="grid grid-cols-1 gap-4">
      <Row Icon={Calendar}   label="Fecha de lanzamiento" value={release_date} />
      <Row Icon={User}       label="Desarrollador"        value={developer} />
      <Row Icon={Cpu}        label="Modelos soportados"   value={main_model} />
      <Row Icon={BadgeCheck} label="Licencia"             value={license} />
    </dl>
  );
}
