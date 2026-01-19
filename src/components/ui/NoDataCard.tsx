export default function NoDataCard({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center h-full ${className}`}>
      <p className="text-md sm:text-lg font-semibold">No data available</p>
    </div>
  );
}