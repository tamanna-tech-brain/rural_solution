const StatusBadge = ({ status }) => {
  const color =
    status === "completed"
      ? "bg-emerald-100 text-emerald-700 ring-1 ring-inset ring-emerald-200"
      : status === "pending"
      ? "bg-amber-100 text-amber-700 ring-1 ring-inset ring-amber-200"
      : status === "resolved"
      ? "bg-sky-100 text-sky-700 ring-1 ring-inset ring-sky-200"
      : "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200";

  return (
    <span className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wide ${color}`}>
      {status}
    </span>
  );
};

export default StatusBadge;