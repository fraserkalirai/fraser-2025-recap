export default function ErrorCard({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center h-full ${className}`}>
      <p className="text-md sm:text-lg font-semibold text-blue-900 dark:text-white">Error loading data</p>
    </div>
  );
}