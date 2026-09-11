"use client";

import { removeAttendance } from "@/app/admin/actions/attendance";

export default function RemoveAttendanceButton({ id }: { id: number }) {
  return (
    <form
      action={removeAttendance.bind(null, id)}
      onSubmit={(e) => {
        if (!confirm("¿Quitar este registro de asistencia?")) {
          e.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        className="rounded-lg border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
      >
        Quitar
      </button>
    </form>
  );
}