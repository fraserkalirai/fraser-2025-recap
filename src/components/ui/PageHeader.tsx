interface PageHeaderProps {
  header: string;
}

export default function PageHeader({ header }: PageHeaderProps) {
  return (
    <h2 className="hidden md:block text-3xl lg:text-5xl font-bold text-blue-900 dark:text-white mb-2 md:mb-8">{header}</h2>
  );
}