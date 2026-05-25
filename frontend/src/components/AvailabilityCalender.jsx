const AvailabilityCalendar = ({ availability = [] }) => {
  return (
    <div className="grid grid-cols-7 gap-2 mt-3">
      {Array.from({ length: 7 }).map((_, i) => {
        const day = availability[i];

        return (
          <div
            key={i}
            className={`p-2 text-center rounded-lg text-xs ${
              day?.isBooked
                ? "bg-red-500 text-white"
                : "bg-green-200"
            }`}
          >
            {day?.date
              ? new Date(day.date).getDate()
              : "Free"}
          </div>
        );
      })}
    </div>
  );
};

export default AvailabilityCalendar;