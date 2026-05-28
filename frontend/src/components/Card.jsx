const Card = ({ children, className = "" }) => {
  return (
    <div
      className={`overflow-hidden rounded-3xl border border-slate-200/70 bg-white/90 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.65)] backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_70px_-35px_rgba(16,185,129,0.55)] ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;