import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { db, auth, storage, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { ArrowLeft, BookOpen, Upload, X, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const CATEGORIES = ['Money', 'Habits', 'Growth & Success'];

export default function CreateStory() {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    category: 'Money',
    tags: '',
    situationBefore: '',
    whatChanged: '',
    exactSteps: '',
    result: '',
    mistakes: '',
    advice: '',
  });

  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf') {
        setError('Only PDF files are allowed');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      setPdfFile(file);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.title || !formData.situationBefore || !formData.whatChanged || !formData.exactSteps || !formData.result || !formData.mistakes || !formData.advice) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let pdfUrl = null;
      if (pdfFile) {
        const fileRef = ref(storage, `stories/${user.uid}/${Date.now()}-${pdfFile.name}`);
        const snapshot = await uploadBytes(fileRef, pdfFile);
        pdfUrl = await getDownloadURL(snapshot.ref);
      }

      const storyId = doc(collection(db, 'stories')).id;
      const storyData = {
        authorId: user.uid,
        authorName: userProfile?.username || user.displayName || 'Anonymous',
        category: formData.category.toLowerCase(),
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
        pdfUrl,
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

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans selection:bg-neutral-200">
      <nav className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-neutral-100 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/home" className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5 text-neutral-600" />
            </Link>
            <div className="flex items-center gap-2 font-medium text-lg tracking-tight">
              <BookOpen className="w-5 h-5" />
              Share Experience
            </div>
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-neutral-900 text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-neutral-800 disabled:opacity-50 transition-all flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Publish Story'}
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <form onSubmit={handleSubmit} className="space-y-12">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-900 px-4 py-3 rounded-xl text-sm flex items-center justify-between">
              {error}
              <button onClick={() => setError('')}><X className="w-4 h-4" /></button>
            </div>
          )}

          {/* Basic Info */}
          <section className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-2">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Give your experience a clear, catchy title"
                className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 transition-all outline-none text-lg font-medium"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-2">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-900 transition-all outline-none appearance-none"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-2">Tags</label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder="e.g. startup, failure, routine (comma separated)"
                  className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-900 transition-all outline-none"
                />
              </div>
            </div>
          </section>

          {/* Content Sections */}
          <section className="space-y-8 pt-8 border-t border-neutral-100">
            <h2 className="text-xl font-semibold">Structured Story</h2>
            
            <div className="space-y-6">
              <FormField 
                label="The Situation Before"
                name="situationBefore"
                placeholder="Where were you before the change? Describe the starting point."
                value={formData.situationBefore}
                onChange={handleChange}
              />
              <FormField 
                label="What Changed?"
                name="whatChanged"
                placeholder="The catalyst or the moment you decided to act differently."
                value={formData.whatChanged}
                onChange={handleChange}
              />
              <FormField 
                label="Exact Steps Taken"
                name="exactSteps"
                placeholder="Step-by-step what did you actually do? Be specific."
                value={formData.exactSteps}
                onChange={handleChange}
              />
              <FormField 
                label="The Result"
                name="result"
                placeholder="What happened? Give numbers, feelings, or tangible outcomes."
                value={formData.result}
                onChange={handleChange}
              />
              <FormField 
                label="Common Mistakes"
                name="mistakes"
                placeholder="What should others avoid doing?"
                value={formData.mistakes}
                onChange={handleChange}
              />
              <FormField 
                label="Advice for Others"
                name="advice"
                placeholder="Your main takeaway for the reader."
                value={formData.advice}
                onChange={handleChange}
              />
            </div>
          </section>

          {/* PDF Upload */}
          <section className="pt-8 border-t border-neutral-100">
            <label className="block text-sm font-semibold text-neutral-900 mb-2">Optional PDF (Documentation/Proofs)</label>
            <div className="relative border-2 border-dashed border-neutral-200 rounded-2xl p-8 hover:border-neutral-300 transition-colors flex flex-col items-center justify-center text-center">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              {pdfFile ? (
                <div className="flex items-center gap-3 bg-neutral-100 px-4 py-2 rounded-lg">
                  <span className="text-sm font-medium">{pdfFile.name}</span>
                  <button type="button" onClick={(e) => { e.preventDefault(); setPdfFile(null); }} className="hover:text-red-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-neutral-400 mb-2" />
                  <p className="text-sm text-neutral-500">Click or drag PDF here to upload (max 5MB)</p>
                </>
              )}
            </div>
          </section>

          <div className="pt-8">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-neutral-900 text-white py-4 rounded-2xl font-medium hover:bg-neutral-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2 text-lg shadow-lg shadow-neutral-200"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Publish Experience'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

function FormField({ label, name, placeholder, value, onChange }: { label: string, name: string, placeholder: string, value: string, onChange: any }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-neutral-700 mb-2">{label}</label>
      <textarea
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        rows={4}
        className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-900 transition-all outline-none resize-none text-neutral-800"
      />
    </div>
  );
}
