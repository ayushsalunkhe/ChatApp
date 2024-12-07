import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <div className="min-h-screen bg-white/10 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-32">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <MessageSquare size={64} className="text-white mx-auto" />
            </motion.div>

            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-5xl md:text-6xl font-bold text-white mb-6"
            >
              Welcome to Ayush's Chat App
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-xl text-white/90 mb-12"
            >
              Connect with friends and family through instant messaging in a modern, secure environment.
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="space-x-4"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/login')}
                className="px-8 py-3 bg-white text-indigo-600 rounded-lg font-medium hover:bg-opacity-90 transition-colors"
              >
                Log In
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/register')}
                className="px-8 py-3 bg-transparent border-2 border-white text-white rounded-lg font-medium hover:bg-white/10 transition-colors"
              >
                Register
              </motion.button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-2">Real-time Chat</h3>
                <p className="text-white/80">
                  Instant messaging with real-time updates and notifications
                </p>
              </div>

              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-2">Secure</h3>
                <p className="text-white/80">
                  Your conversations are private and protected
                </p>
              </div>

              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-2">Modern UI</h3>
                <p className="text-white/80">
                  Beautiful and intuitive interface for the best experience
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
