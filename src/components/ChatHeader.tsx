import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';

interface ChatHeaderProps {
  onOpenSettings: () => void;
}

export default function ChatHeader({ onOpenSettings }: ChatHeaderProps) {
  const { currentUser } = useAuth();
  const [darkMode, setDarkMode] = useState(() => 
    document.documentElement.classList.contains('dark')
  );

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', newDarkMode.toString());
  };

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <div className="h-16 bg-gray-200 dark:bg-gray-800 flex items-center justify-between px-4">
      <div className="flex items-center space-x-4">
        <img
          src={currentUser?.photoURL || 'https://via.placeholder.com/40'}
          alt="Profile"
          className="w-10 h-10 rounded-full"
        />
        <span className="font-medium dark:text-white">
          {currentUser?.displayName || 'User'}
        </span>
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={toggleDarkMode}
          className="p-2 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-full transition-colors"
          aria-label="Toggle dark mode"
        >
          {darkMode ? '🌞' : '🌙'}
        </button>
        <button
          onClick={onOpenSettings}
          className="p-2 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-full transition-colors"
          aria-label="Open settings"
        >
          ⚙️
        </button>
      </div>
    </div>
  );
}
