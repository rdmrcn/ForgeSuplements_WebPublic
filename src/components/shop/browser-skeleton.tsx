export function BrowserSkeleton() {
  return (
    <div className="container-x" aria-busy="true" aria-label="Loading products">
      <div className="skeleton mb-8 h-12" />
      <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:ml-[16rem]">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i}>
            <div className="skeleton aspect-[4/5]" />
            <div className="skeleton mt-4 h-6 w-2/3" />
            <div className="skeleton mt-2 h-4 w-1/3" />
          </div>
        ))}
      </div>
    </div>
  );
}
