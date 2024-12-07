import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ViewAvatarProps {
  isOpen: boolean;
  onClose: () => void;
  avatar?: string;
  name: string;
}

export default function ViewAvatar({ isOpen, onClose, avatar, name }: ViewAvatarProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.95 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-4 max-w-lg w-full mx-4 relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-2 right-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="h-6 w-6 text-gray-500 dark:text-gray-400" />
          </button>
          
          <div className="mt-4 flex flex-col items-center">
            {avatar ? (
              <div className="w-64 h-64 rounded-lg overflow-hidden">
                <img
                  src={avatar}
                  alt={`${name}'s profile`}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-64 h-64 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                <span className="text-6xl font-bold text-white">
                  {name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <h3 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
              {name}
            </h3>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
