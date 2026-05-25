const StatusBadge = ({ status }) => {
  const color =
    status === "completed"
      ? "bg-green-100 text-green-700"
      : status === "pending"
      ? "bg-yellow-100 text-yellow-700"
      : status === "resolved"
      ? "bg-blue-100 text-blue-700"
      : "bg-gray-100 text-gray-700";

  return (
    <span className={`px-3 py-1 text-xs rounded-full ${color}`}>
      {status}
    </span>
  );
};

export default StatusBadge;