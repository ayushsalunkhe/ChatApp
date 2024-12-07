import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { ArrowLeft, Info } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showTooltip, setShowTooltip] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(username, password)
      .then(() => {
        toast.success('Login successful!');
        navigate('/chat');
      })
      .catch(() => {
        toast.error('Invalid credentials!');
      });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500"
    >
      <div className="absolute top-4 left-4">
        <button
          onClick={() => navigate('/')}
          className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
      </div>
      
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="max-w-md w-full mx-4 bg-white/10 backdrop-blur-sm p-8 rounded-xl shadow-lg"
      >
        <div>
          <h2 className="text-center text-3xl font-bold text-white mb-2">
            Welcome back
          </h2>
          <div className="relative">
            <p className="text-center text-white/80 mb-8">
              Sign in to continue to chat
              <button
                className="ml-2 inline-flex items-center"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                <Info size={16} className="text-white/60 hover:text-white/80" />
              </button>
            </p>
            {showTooltip && (
              <div className="absolute z-10 w-64 p-2 mt-1 text-sm text-white bg-gray-900 rounded-lg shadow-lg -right-8 top-6">
                You can access your account from any device. Simply log in with your username and password.
              </div>
            )}
          </div>
        </div>
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="text-white/90">
                Username
              </label>
              <input
                id="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                placeholder="Enter your username"
              />
            </div>
            <div>
              <label htmlFor="password" className="text-white/90">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full py-2 px-4 bg-white text-indigo-600 rounded-lg font-medium hover:bg-opacity-90 transition-colors"
            >
              Sign in
            </motion.button>
          </div>
          
          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="text-sm text-white hover:text-white/80"
            >
              Don't have an account? Register
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
