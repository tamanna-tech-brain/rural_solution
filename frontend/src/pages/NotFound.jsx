import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Wheat, Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--color-bg)] p-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="max-w-md"
      >
        {/* Icon */}
        <motion.div
          animate={{ rotate: [0, -10, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-400 to-green-700 shadow-2xl"
        >
          <Wheat size={44} className="text-white" />
        </motion.div>

        {/* 404 */}
        <h1 className="mb-2 text-8xl font-extrabold gradient-text">404</h1>
        <h2 className="mb-3 text-2xl font-bold text-slate-800 dark:text-slate-100">
          Field Not Found
        </h2>
        <p className="mb-8 text-slate-500 dark:text-slate-400">
          Looks like this crop didn't grow here. The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Actions */}
        <div className="flex justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="btn btn-ghost flex items-center gap-2"
          >
            <ArrowLeft size={16} /> Go Back
          </button>
          <button
            onClick={() => navigate('/')}
            className="btn btn-primary flex items-center gap-2"
          >
            <Home size={16} /> Dashboard
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
