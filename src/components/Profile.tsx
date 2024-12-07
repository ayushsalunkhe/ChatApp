import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Camera, ArrowLeft, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Profile() {
  const { currentUser, updateProfile, deleteAccount } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(currentUser?.name || '');
  const [username, setUsername] = useState(currentUser?.username || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [avatar, setAvatar] = useState(currentUser?.avatar || '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');

  if (!currentUser) {
    navigate('/login');
    return null;
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setAvatar(base64String);
        updateProfile({ avatar: base64String });
        toast.success('Profile picture updated successfully');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updates: any = {};
    
    if (name !== currentUser.name) updates.name = name;
    if (username !== currentUser.username) updates.username = username;
    if (newPassword) updates.password = newPassword;
    
    // If there are no updates, return
    if (Object.keys(updates).length === 0) {
      toast.error('No changes to save');
      return;
    }

    // If trying to change password but no old password provided
    if (newPassword && !oldPassword) {
      toast.error('Please provide your current password');
      return;
    }

    updateProfile(updates, oldPassword)
      .then(() => {
        toast.success('Profile updated successfully!');
        setOldPassword('');
        setNewPassword('');
      })
      .catch(() => {
        if (newPassword) {
          toast.error('Current password is incorrect');
        } else {
          toast.error('Username is already taken');
        }
      });
  };

  const handleDeleteAccount = () => {
    if (!deletePassword) {
      toast.error('Please enter your password to confirm deletion');
      return;
    }

    deleteAccount(deletePassword)
      .then(() => {
        toast.success('Account deleted successfully');
        navigate('/login');
      })
      .catch(() => {
        toast.error('Incorrect password');
      });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8"
    >
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/chat')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <ArrowLeft className="text-gray-500 dark:text-gray-400" />
              </button>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Profile Settings</h2>
            </div>
          </div>

          <div className="p-6">
            <div className="flex flex-col items-center mb-8">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-gray-400">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-2 bg-indigo-600 rounded-full text-white hover:bg-indigo-700 transition-colors"
                >
                  <Camera size={20} />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Save Changes
                </button>
              </div>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-red-600 dark:text-red-400">Danger Zone</h3>
                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 size={20} />
                    Delete Account
                  </button>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Please enter your password to confirm account deletion. This action cannot be undone.
                    </p>
                    <input
                      type="password"
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      placeholder="Enter your password"
                      className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:border-red-500 focus:ring-red-500"
                    />
                    <div className="flex gap-4">
                      <button
                        onClick={handleDeleteAccount}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                      >
                        Confirm Deletion
                      </button>
                      <button
                        onClick={() => {
                          setShowDeleteConfirm(false);
                          setDeletePassword('');
                        }}
                        className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
