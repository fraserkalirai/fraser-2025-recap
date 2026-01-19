interface MetricCardProps {
  label: string
  primaryDataPoint: string
  secondaryDataPoint?: string
}

export default function MetricCard({ label, primaryDataPoint, secondaryDataPoint }: MetricCardProps) {
  return (
    <div className="flex-1 bg-blue-50 dark:bg-blue-950 p-4 rounded-lg shadow-lg flex flex-col justify-center">
      <h3 className="text-sm sm:text-base lg:text-xl font-medium text-blue-900 dark:text-white">
        {label}
      </h3>
      <div className="flex items-baseline space-x-1 sm:space-x-2">
        <p className="mt-2 text-2xl sm:text-3xl lg:text-5xl font-semibold text-blue-900 dark:text-white">
          {primaryDataPoint}
        </p>
        {secondaryDataPoint && (
          <p className="mt-2 text-sm sm:text-md font-medium text-blue-900/60 dark:text-white/60">
            {secondaryDataPoint}
          </p>
        )}
      </div>
    </div>
  );
}