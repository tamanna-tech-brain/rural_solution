const LoadingSkeleton = ({ className = '', width, height, rounded = 'rounded-lg' }) => (
  <div
    className={`skeleton ${rounded} ${className}`}
    style={{ width, height: height || '1em' }}
  />
);

export const CardSkeleton = () => (
  <div className="card p-5 animate-fade-in">
    <div className="flex items-center gap-3 mb-4">
      <LoadingSkeleton width={40} height={40} rounded="rounded-full" />
      <div className="flex-1 space-y-2">
        <LoadingSkeleton height={14} />
        <LoadingSkeleton width="60%" height={12} />
      </div>
    </div>
    <LoadingSkeleton height={120} className="mb-3" />
    <LoadingSkeleton height={14} className="mb-2" />
    <LoadingSkeleton width="80%" height={14} />
  </div>
);

export const TableSkeleton = ({ rows = 5, cols = 4 }) => (
  <div className="card overflow-hidden">
    <div className="p-4 border-b border-[var(--color-border)]">
      <LoadingSkeleton width={200} height={20} />
    </div>
    <div className="divide-y divide-[var(--color-border)]">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4">
          {Array.from({ length: cols }).map((_, j) => (
            <LoadingSkeleton key={j} className="flex-1" height={16} />
          ))}
        </div>
      ))}
    </div>
  </div>
);

export const StatSkeleton = () => (
  <div className="card p-5">
    <LoadingSkeleton width={40} height={40} rounded="rounded-xl" className="mb-3" />
    <LoadingSkeleton height={28} className="mb-2" />
    <LoadingSkeleton width="60%" height={14} />
  </div>
);

export const PageSkeleton = () => (
  <div className="space-y-6 animate-fade-in">
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {[1,2,3,4].map(i => <StatSkeleton key={i} />)}
    </div>
    <div className="grid gap-4 lg:grid-cols-3">
      {[1,2,3].map(i => <CardSkeleton key={i} />)}
    </div>
  </div>
);

export default LoadingSkeleton;
