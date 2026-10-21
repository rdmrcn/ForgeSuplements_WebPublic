export default function Loading() {
  return (
    <div className="container-x py-16" aria-busy="true" aria-label="Loading">
      <div className="skeleton h-16 w-2/3 max-w-xl" />
      <div className="mt-10 grid grid-cols-2 gap-5 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i}>
            <div className="skeleton aspect-[4/5]" />
            <div className="skeleton mt-4 h-6 w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );
}
