import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, HelpCircle, MessageCircle, CheckCircle, X, Tag } from 'lucide-react';
import { createHelpPost, getHelpPosts, replyToPost, deleteHelpPost } from '../api/api';
import { CardSkeleton } from '../components/LoadingSkeleton';
import ConfirmDialog from '../components/ConfirmDialog';
import useAuth from '../hooks/useAuth';
import useToast from '../hooks/useToast';

const CATEGORIES = ['General', 'Equipment', 'Mandi', 'Payment', 'Dispute', 'Account'];

const HelpDeskPage = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [replyTarget, setReplyTarget] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const [formData, setFormData] = useState({ title: '', content: '', category: 'General' });

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await getHelpPosts();
      setPosts(res.data || []);
    } catch { toast.error('Failed to load posts.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPosts(); }, []);

  const resetForm = () => { setFormData({ title: '', content: '', category: 'General' }); setShowForm(false); };

  const handleSubmit = async () => {
    if (!formData.title || !formData.content) return toast.error('Fill all required fields.');
    setSubmitting(true);
    try {
      await createHelpPost(formData);
      toast.success('Help post created!');
      resetForm();
      fetchPosts();
    } catch (err) { toast.error(err?.response?.data?.message || 'Failed to create post.'); }
    finally { setSubmitting(false); }
  };

  const handleReply = async (postId) => {
    if (!replyText.trim()) return toast.error('Write a reply first.');
    try {
      await replyToPost(postId, { reply: replyText, adminId: user?._id });
      toast.success('Reply posted!');
      setReplyTarget(null);
      setReplyText('');
      fetchPosts();
    } catch (err) { toast.error(err?.response?.data?.message || 'Failed to post reply.'); }
  };

  const confirmDelete = async () => {
    try {
      await deleteHelpPost(deleteTarget);
      toast.success('Post deleted.');
      fetchPosts();
    } catch (err) { toast.error(err?.response?.data?.message || 'Delete failed.'); }
    finally { setDeleteTarget(null); }
  };

  const filtered = filterCategory ? posts.filter(p => p.category === filterCategory) : posts;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="page-header mb-0">
          <h1>💬 Help Desk</h1>
          <p>Ask questions and get support from the community</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn btn-primary shrink-0"><Plus size={16}/> Ask a Question</button>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setFilterCategory('')} className={`badge cursor-pointer text-sm py-1.5 px-3 ${!filterCategory ? 'badge-green' : 'badge-gray'}`}>
          All
        </button>
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setFilterCategory(c === filterCategory ? '' : c)}
            className={`badge cursor-pointer text-sm py-1.5 px-3 ${filterCategory===c ? 'badge-blue' : 'badge-gray'}`}>
            {c}
          </button>
        ))}
      </div>

      {/* Posts */}
      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i=><CardSkeleton key={i}/>)}</div>
      ) : filtered.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <HelpCircle size={48} className="mb-4 text-slate-300"/>
          <h3 className="font-semibold text-slate-600 dark:text-slate-300">No posts found</h3>
          <p className="mt-1 text-sm text-slate-400">Be the first to ask a question!</p>
          <button onClick={() => setShowForm(true)} className="btn btn-primary mt-4"><Plus size={14}/> Ask a Question</button>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((post, i) => (
            <motion.div key={post._id} className="card overflow-hidden" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}}>
              <div className="p-5">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="badge badge-blue"><Tag size={10}/>{post.category || 'General'}</span>
                      {post.adminReply && <span className="badge badge-green"><CheckCircle size={10}/> Answered</span>}
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100">{post.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">By {post.userId?.name} • {new Date(post.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setExpandedId(p => p === post._id ? null : post._id)}
                      className="btn btn-ghost py-1 px-2.5 text-xs">
                      <MessageCircle size={12}/> {post.adminReply ? 'View Reply' : 'Reply'}
                    </button>
                    {post.userId?._id === user?._id && (
                      <button onClick={() => setDeleteTarget(post._id)} className="btn btn-danger py-1 px-2.5 text-xs"><X size={12}/></button>
                    )}
                  </div>
                </div>

                <AnimatePresence>
                  {expandedId === post._id && (
                    <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}} className="overflow-hidden">
                      <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">{post.content}</p>
                        {post.adminReply && (
                          <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-4">
                            <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-1 flex items-center gap-1"><CheckCircle size={12}/> Official Reply</p>
                            <p className="text-sm text-emerald-800 dark:text-emerald-300">{post.adminReply}</p>
                          </div>
                        )}
                        {!post.adminReply && (
                          <div className="mt-3">
                            <textarea
                              className="input-field h-20 resize-none"
                              placeholder="Write a reply…"
                              value={replyTarget === post._id ? replyText : ''}
                              onFocus={() => setReplyTarget(post._id)}
                              onChange={e => setReplyText(e.target.value)}
                            />
                            <button onClick={() => handleReply(post._id)} className="btn btn-primary mt-2 text-xs py-1.5">Post Reply</button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
            <motion.div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={resetForm}/>
            <motion.div className="relative z-10 w-full max-w-md rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-2xl" initial={{scale:0.95,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:0.95,opacity:0}}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Ask a Question</h2>
                <button onClick={resetForm} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"><X size={18}/></button>
              </div>
              <div className="space-y-3">
                <select className="input-field" value={formData.category} onChange={e=>setFormData(p=>({...p,category:e.target.value}))}>
                  {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
                </select>
                <input className="input-field" placeholder="Question title *" value={formData.title} onChange={e=>setFormData(p=>({...p,title:e.target.value}))} />
                <textarea className="input-field h-28 resize-none" placeholder="Describe your issue in detail *" value={formData.content} onChange={e=>setFormData(p=>({...p,content:e.target.value}))} />
                <div className="flex gap-3 pt-2">
                  <button onClick={handleSubmit} disabled={submitting} className="btn btn-primary flex-1">{submitting?'Posting…':'Post Question'}</button>
                  <button onClick={resetForm} className="btn btn-ghost flex-1">Cancel</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <ConfirmDialog isOpen={!!deleteTarget} onConfirm={confirmDelete} onCancel={()=>setDeleteTarget(null)} title="Delete Post" message="Delete this help post?" confirmText="Delete" confirmVariant="danger"/>
    </div>
  );
};

export default HelpDeskPage;