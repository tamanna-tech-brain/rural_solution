import toast from 'react-hot-toast';

const useToast = () => {
  const success = (msg) => toast.success(msg);
  const error = (msg) => toast.error(msg || 'Something went wrong.');
  const loading = (msg) => toast.loading(msg || 'Loading...');
  const info = (msg) => toast(msg, { icon: 'ℹ️' });
  const warning = (msg) => toast(msg, { icon: '⚠️', style: { background: '#fef9c3', color: '#92400e' } });
  const promise = (prom, msgs) => toast.promise(prom, msgs);
  const dismiss = (id) => toast.dismiss(id);

  return { success, error, loading, info, warning, promise, dismiss };
};

export default useToast;
