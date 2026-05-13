import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { db, storage, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { 
  ArrowLeft, 
  X, 
  Loader2, 
  Sparkles, 
  Hash,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import CategorySelector from '../components/CategorySelector';

export default function CreateStory() {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    tags: '',
    situationBefore: '',
    whatChanged: '',
    exactSteps: '',
    result: '',
    mistakes: '',
    advice: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCategoryChange = (category: string) => {
    setFormData(prev => ({ ...prev, category }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.title || !formData.category || !formData.situationBefore || !formData.whatChanged || !formData.exactSteps || !formData.result || !formData.mistakes || !formData.advice) {
      setError('Please fill in all required fields including category');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const storyId = doc(collection(db, 'stories')).id;
      const storyData = {
        authorId: user.uid,
        authorName: userProfile?.username || user.displayName || 'Anonymous',
        authorUsername: userProfile?.username || null,
        category: formData.category,
        title: formData.title,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
        contentSections: {
          situationBefore: formData.situationBefore,
          whatChanged: formData.whatChanged,
          exactSteps: formData.exactSteps,
          result: formData.result,
          mistakes: formData.mistakes,
          advice: formData.advice,
        },
        pdfUrl: null,
        createdAt: serverTimestamp(),
        likes: 0,
        saves: 0,
        views: 0,
      };

      await setDoc(doc(db, 'stories', storyId), storyData);
      navigate('/home');
    } catch (err: any) {
      console.error('Error creating story:', err);
      setError(err.message || 'Failed to publish story');
      handleFirestoreError(err, OperationType.CREATE, 'stories');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/home');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-[#F0F2F5] text-[#050505] font-sans pb-24"
    >
      {/* Top Nav */}
      <nav className="fixed top-0 w-full z-50 bg-white shadow-sm h-14 flex items-center px-4 transition-all">
        <div className="max-w-[1200px] w-full mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button onClick={handleBack} className="p-2 hover:bg-[#F0F2F5] rounded-full transition-colors mr-2">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="font-bold text-[17px] hidden sm:block">Create Story</span>
          </div>
          
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-[#0866FF] text-white px-5 py-1.5 rounded-lg text-[15px] font-semibold hover:bg-[#0759E0] disabled:opacity-50 transition-colors flex items-center gap-2 shadow-sm"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Publish
          </button>
        </div>
      </nav>

      <main className="max-w-[680px] mx-auto px-4 pt-[72px]">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-[#E4E6EB] flex items-center justify-center font-bold text-gray-500 overflow-hidden">
                {userProfile?.profileImage || userProfile?.profilePhoto ? (
                  <img src={userProfile.profileImage || userProfile.profilePhoto!} alt={userProfile.username} className="w-full h-full object-cover" />
                ) : (
                  userProfile?.username?.charAt(0).toUpperCase() || 'U'
                )}
             </div>
             <div className="flex flex-col">
                <span className="font-semibold text-[15px]">{userProfile?.username || 'User'}</span>
                <span className="text-[13px] text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded-full inline-block w-fit">Public</span>
             </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 text-red-500 px-4 py-3 rounded-xl flex items-center justify-between border border-red-100">
                <div className="flex items-center gap-3 font-semibold text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
                <button type="button" onClick={() => setError('')}><X className="w-4 h-4 opacity-50 hover:opacity-100 transition-opacity" /></button>
              </div>
            )}

            <div className="space-y-4">
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Story Title"
                className="w-full text-2xl font-bold text-gray-900 placeholder:text-gray-400 focus:outline-none bg-transparent"
              />
              
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-[13px] font-semibold text-gray-500 mb-1 ml-1">Category</label>
                  <CategorySelector 
                    value={formData.category}
                    onChange={handleCategoryChange}
                  />
                </div>
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-[13px] font-semibold text-gray-500 mb-1 ml-1">Tags (comma separated)</label>
                  <div className="relative flex items-center">
                    <Hash className="absolute left-3 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      name="tags"
                      value={formData.tags}
                      onChange={handleChange}
                      placeholder="startup, growth, failure"
                      className="w-full pl-9 pr-4 py-2 bg-[#F0F2F5] border-none rounded-lg focus:ring-2 focus:ring-[#0866FF] text-[15px]"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8 pt-4 pb-6">
               {[
                 { id: 'situationBefore', label: 'The Situation Before', placeholder: 'What was going on?' },
                 { id: 'whatChanged', label: 'The Turning Point', placeholder: 'What changed?' },
                 { id: 'exactSteps', label: 'Exact Steps Taken', placeholder: 'How did you do it?' },
                 { id: 'result', label: 'The Result', placeholder: 'What was the outcome?' },
                 { id: 'mistakes', label: 'Mistakes & Pitfalls', placeholder: 'What should others avoid?' },
                 { id: 'advice', label: 'Final Advice', placeholder: 'One key takeaway...' }
               ].map((field) => (
                 <div key={field.id} className="space-y-2">
                    <label className="block text-[14px] font-bold text-gray-700 ml-1 uppercase tracking-tight">{field.label}</label>
                    <textarea
                      name={field.id}
                      placeholder={field.placeholder}
                      value={(formData as any)[field.id]}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-[#F0F2F5] border-none rounded-xl focus:ring-2 focus:ring-[#0866FF] text-[15px] min-h-[120px] resize-none"
                    />
                 </div>
               ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0866FF] text-white py-3 rounded-lg font-bold hover:bg-[#0759E0] disabled:opacity-50 transition-colors text-[17px] flex items-center justify-center gap-2 shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Publishing...
                </>
              ) : 'Publish Post'}
            </button>
          </form>
        </div>
      </main>
    </motion.div>
  );
}
