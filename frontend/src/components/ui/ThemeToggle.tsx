import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex bg-gray-100 dark:bg-gray-800 rounded-full p-1 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
      <button
        onClick={() => setTheme('light')}
        className={cn(
          "p-1.5 rounded-full transition-all duration-300 text-gray-500 hover:text-gray-900 dark:hover:text-gray-300",
          theme === 'light' && "bg-white text-brand-600 shadow-sm dark:bg-transparent dark:text-gray-400"
        )}
        title="Light Mode"
      >
        <Sun size={16} />
      </button>
      <button
        onClick={() => setTheme('system')}
        className={cn(
          "p-1.5 rounded-full transition-all duration-300 text-gray-500 hover:text-gray-900 dark:hover:text-gray-300",
          theme === 'system' && "bg-white dark:bg-gray-700 text-brand-600 dark:text-brand-400 shadow-sm"
        )}
        title="System Preference"
      >
        <Monitor size={16} />
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={cn(
          "p-1.5 rounded-full transition-all duration-300 text-gray-500 hover:text-gray-900 dark:hover:text-gray-300",
          theme === 'dark' && "bg-transparent text-gray-500 dark:bg-gray-700 dark:text-brand-400 shadow-sm"
        )}
        title="Dark Mode"
      >
        <Moon size={16} />
      </button>
    </div>
  );
}
