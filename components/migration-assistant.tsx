"use client";

import { useState } from "react";
import { read, utils } from "xlsx";
import {
  importClients,
  type ImportMapping,
  type ImportResult,
} from "@/app/admin/actions/import";

const FIELDS: { key: keyof ImportMapping; label: string; sample: string }[] = [
  { key: "nombre", label: "Nombre *", sample: "Juan Pérez" },
  { key: "dni", label: "DNI", sample: "30111222" },
  { key: "telefono", label: "Teléfono", sample: "11 5555 1001" },
  { key: "email", label: "Email", sample: "juan@mail.com" },
  { key: "plan", label: "Plan", sample: "Mensual" },
  { key: "vencimiento", label: "Vencimiento", sample: "27/07/2026" },
];

function isEmptyRow(row: unknown[]): boolean {
  return row.every((v) => v === null || v === undefined || String(v).trim() === "");
}

function cellText(v: unknown): string {
  if (v === null || v === undefined) return "";
  if (v instanceof Date) {
    const d = v;
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    return `${dd}/${mm}/${d.getFullYear()}`;
  }
  return String(v).trim();
}

const EMPTY_MAPPING: ImportMapping = {
  dni: "",
  nombre: "",
  telefono: "",
  email: "",
  plan: "",
  vencimiento: "",
};

export default function MigrationAssistant() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [rows, setRows] = useState<unknown[][] | null>(null);
  const [headerIndex, setHeaderIndex] = useState(0);
  const [mapping, setMapping] = useState<ImportMapping>(EMPTY_MAPPING);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  async function handleFile(file: File) {
    try {
      const buf = await file.arrayBuffer();
      const wb = read(buf, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const parsed: unknown[][] = utils.sheet_to_json(ws, {
        header: 1,
        defval: "",
      });
      setRows(parsed.filter((r) => r.some((v) => v !== "" && v !== null)));
      setFileName(`${file.name} · hoja "${wb.SheetNames[0]}"`);
      setHeaderIndex(0);
      setMapping(EMPTY_MAPPING);
      setResult(null);
    } catch {
      setFileName(`${file.name} · no se pudo leer`);
      setRows(null);
    }
  }

  const header = rows && rows.length > 0 ? rows[headerIndex] : null;
  const headerCols = header ? Math.max(header.length, ...rows!.slice(headerIndex + 1).map((r) => r.length)) : 0;
  const dataRows = rows ? rows.slice(headerIndex + 1).filter((r) => !isEmptyRow(r)) : [];

  const previewRows = rows ? rows.slice(0, Math.min(rows.length, headerIndex + 11)) : [];

  function setField(key: keyof ImportMapping, value: string) {
    setMapping((m) => ({ ...m, [key]: value }));
    setResult(null);
  }

  async function runImport() {
    if (!rows || !mapping.nombre) return;
    setBusy(true);
    setResult(null);
    try {
      const res = await importClients(dataRows, mapping);
      setResult(res);
    } catch {
      setResult({ ok: false, total: dataRows.length, imported: 0, errorCount: 1, errors: [{ row: 0, dni: null, message: "Error interno al importar." }] });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold">1 · Subí el archivo</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Excel (.xlsx, .xls) o CSV. Se lee la primera hoja. No se modifica tu
          archivo original.
        </p>
        <label className="mt-4 flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-zinc-300 px-4 py-8 text-center transition hover:border-red-400 hover:bg-red-50/40">
          <span className="text-sm font-semibold text-zinc-600">
            {fileName ?? "Elegí el archivo…"}
          </span>
          <span className="text-xs text-zinc-400">
            {rows ? "Presioná para elegir otro" : "o arrastrá el Excel del gimnasio acá"}
          </span>
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
        </label>
        <p className="mt-3 text-xs text-zinc-400">
          Tip: si tu planilla es larga, no hace falta limpiarla. Solo marcá las
          columnas correctas y el sistema se encarga del resto.
        </p>
      </section>

      {rows && (
        <>
          <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold">2 · Elegí la fila del encabezado</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Buscá la fila que contiene los títulos de las columnas.
            </p>
            <div className="mt-3 grid gap-3 text-sm md:grid-cols-[1fr_auto_1fr]">
              {previewRows.map((r, i) => (
                <label
                  key={i}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 transition ${
                    i === headerIndex
                      ? "border-red-500 bg-red-50"
                      : "border-zinc-200 hover:border-zinc-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="header"
                    checked={i === headerIndex}
                    onChange={() => {
                      setHeaderIndex(i);
                      setMapping(EMPTY_MAPPING);
                      setResult(null);
                    }}
                  />
                  <span className="font-semibold text-zinc-400">Fila {i + 1}</span>
                  <span className="truncate text-zinc-600">
                    {r.map(cellText).filter(Boolean).slice(0, 3).join(" · ") || "—vacio—"}
                  </span>
                </label>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold">3 · Mapeá las columnas</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {FIELDS.map((f) => (
                <label key={f.key} className="block">
                  <span className="mb-1 block text-sm font-medium text-zinc-700">
                    {f.label}
                    {f.key === "nombre" && (
                      <span className="ml-1 text-xs text-zinc-400">(obligatoria)</span>
                    )}
                  </span>
                  <select
                    value={mapping[f.key]}
                    onChange={(e) => setField(f.key, e.target.value)}
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">— no importar —</option>
                    {Array.from({ length: headerCols }).map((_, i) => (
                      <option key={i} value={String(i)}>
                        {utils.encode_col(i)} {cellText(header?.[i]).slice(0, 20) || `(columna vacía)`}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>

            {mapping.nombre && (
              <div className="mt-4 overflow-x-auto rounded-xl border border-zinc-200">
                <table className="w-full text-left text-sm">
                  <thead className="bg-zinc-50">
                    <tr>
                      {Array.from({ length: headerCols }).map((_, i) => (
                        <th key={i} className="px-3 py-2 font-semibold text-zinc-600">
                          {utils.encode_col(i)}
                          <span className="ml-1 font-normal text-zinc-400">
                            {cellText(header?.[i]).slice(0, 12)}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {rows.slice(headerIndex + 1, headerIndex + 6).map((r, ri) => (
                      <tr key={ri}>
                        {r.slice(0, headerCols).map((v, i) => (
                          <td key={i} className="max-w-40 truncate px-3 py-1.5 text-zinc-600">
                            {cellText(v) || "·"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold">Importar</h2>
                <p className="mt-1 text-sm text-zinc-500">
                  {dataRows.length} fila{dataRows.length === 1 ? "" : "s"} a importar.{" "}
                  {mapping.dni !== "" &&
                  dataRows.some((r) => !cellText(rowAt(r, mapping.dni)))
                    ? "Algunas filas no tienen DNI: se importan igual."
                    : ""}
                </p>
              </div>
              <button
                type="button"
                disabled={busy || !mapping.nombre || dataRows.length === 0}
                onClick={runImport}
                className="rounded-xl bg-red-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-40"
              >
                {busy ? "Importando…" : "Importar clientes"}
              </button>
            </div>
            <p className="mt-3 text-xs text-zinc-400">
              {result ? "" : "Se importan como socios con su plan y vencimiento actuales. No se trae historial de pagos ni de asistencias. El DNI es obligatorio pero si falta, se importa igual y podés cargarlo después."}
            </p>

            {result && (
              <div className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                {result.errorCount === 0 ? (
                  <p className="font-semibold text-emerald-600">
                    ✓ {result.imported} cliente{result.imported === 1 ? "" : "s"} importado{result.imported === 1 ? "" : "s"} correctamente.
                  </p>
                ) : (
                  <>
                    <p className="font-semibold text-amber-700">
                      Importados {result.imported} de {result.total}. {result.errorCount} fila{result.errorCount === 1 ? "" : "s"} con problemas:
                    </p>
                    <ul className="mt-2 space-y-1 text-sm">
                      {result.errors.map((er, i) => (
                        <li key={i} className="text-zinc-600">
                          <span className="font-semibold text-zinc-700">Fila {er.row}</span>
                          {er.dni ? ` · DNI ${er.dni}` : ""} — {er.message}
                        </li>
                      ))}
                      {result.errorCount > result.errors.length && (
                        <li className="text-zinc-400">
                          y {result.errorCount - result.errors.length} más.
                        </li>
                      )}
                    </ul>
                  </>
                )}
                <p className="mt-3 text-xs text-zinc-400">
                  Revisá los errores en tu archivo, corregilos y volvé a importar: las
                  filas ya cargadas no se duplican si tienen DNI.
                </p>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );

  function rowAt(row: unknown[], index: string): unknown {
  const i = parseInt(index, 10);
  if (Number.isNaN(i)) return "";
  return row[i] ?? "";
}
}