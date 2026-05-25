const Card = ({ children, className = "" }) => {
  return (
    <div
      className={`bg-white/80 backdrop-blur border border-gray-100 
      rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300
      hover:-translate-y-1 ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;