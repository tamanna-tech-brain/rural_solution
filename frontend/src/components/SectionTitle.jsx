const SectionTitle = ({ title, subtitle }) => {
  return (
    <div className="mb-5">
      <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
      <p className="text-sm text-gray-500">{subtitle}</p>
    </div>
  );
};

export default SectionTitle;