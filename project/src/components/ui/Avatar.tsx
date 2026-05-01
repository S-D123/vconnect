interface AvatarProps {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeMap = {
  sm: 'w-7 h-7 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-20 h-20 text-2xl',
};

const colors = [
  'bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300',
  'bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-300',
  'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300',
  'bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-300',
  'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300',
];

function getColor(name: string) {
  const idx = name.charCodeAt(0) % colors.length;
  return colors[idx];
}

export default function Avatar({ src, name, size = 'md', className = '' }: AvatarProps) {
  const sizeClass = sizeMap[size];
  const colorClass = getColor(name);

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizeClass} rounded-full object-cover flex-shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} ${colorClass} rounded-full flex items-center justify-center font-semibold flex-shrink-0 ${className}`}
    >
      {name?.[0]?.toUpperCase() ?? '?'}
    </div>
  );
}
