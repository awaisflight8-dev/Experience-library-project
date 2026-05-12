import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, where, Timestamp } from 'firebase/firestore';
import { BookOpen, LogOut, Search, PlusCircle, User as UserIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Story {
  id: string;
  title: string;
  category: string;
  authorName: string;
  createdAt: Timestamp;
  contentSections?: {
    situationBefore: string;
    whatChanged: string;
    exactSteps: string;
    result: string;
    mistakes: string;
    advice: string;
  };
}

const CATEGORIES = ['All', 'Money', 'Habits', 'Growth & Success'];

export default function Home() {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All');
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    let q = query(collection(db, 'stories'), orderBy('createdAt', 'desc'));
    
    if (activeCategory !== 'All') {
      q = query(collection(db, 'stories'), where('category', '==', activeCategory.toLowerCase()), orderBy('createdAt', 'desc'));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const storiesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Story[];
      setStories(storiesData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching stories:", error);
      setLoading(false);
    });

    return unsubscribe;
  }, [user, activeCategory]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans selection:bg-neutral-200">
      {/* Navbar */}
      <nav className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-neutral-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/home" className="flex items-center gap-2 font-medium text-lg tracking-tight">
            <BookOpen className="w-5 h-5" />
            Experience Library
          </Link>
          
          <div className="flex items-center gap-6">
            <button className="flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors">
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Search</span>
            </button>
            <div className="w-px h-4 bg-neutral-200 hidden sm:block"></div>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
            <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center overflow-hidden">
              {userProfile?.profilePhoto ? (
                <img src={userProfile.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-4 h-4 text-neutral-500" />
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Main Feed */}
          <div className="flex-1 max-w-3xl">
            {/* New Story Trigger */}
            <Link to="/create" className="mb-8 p-4 bg-white rounded-2xl border border-neutral-100 flex items-center gap-4 cursor-pointer hover:border-neutral-200 transition-colors shadow-sm">
              <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center flex-shrink-0">
                <PlusCircle className="w-5 h-5 text-neutral-600" />
              </div>
              <div className="flex-1 text-neutral-500">
                Share an experience...
              </div>
              <button className="bg-neutral-900 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-neutral-800 transition-colors">
                Write
              </button>
            </Link>

            {/* Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide">
              {CATEGORIES.map(category => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    activeCategory === category 
                      ? 'bg-neutral-900 text-white' 
                      : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Feed */}
            <div className="space-y-6">
              {loading ? (
                <div className="text-center py-12 text-neutral-500">Loading stories...</div>
              ) : stories.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-neutral-100 border-dashed">
                  <BookOpen className="w-8 h-8 text-neutral-300 mx-auto mb-3" />
                  <p className="text-neutral-500">No experiences found in this category.</p>
                </div>
              ) : (
                stories.map(story => (
                  <article key={story.id} className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center">
                        <UserIcon className="w-4 h-4 text-neutral-500" />
                      </div>
                      <div>
                        <div className="font-medium text-sm text-neutral-900">{story.authorName}</div>
                        <div className="text-xs text-neutral-500">
                          {story.createdAt?.toDate ? story.createdAt.toDate().toLocaleDateString() : 'Just now'} · <span className="capitalize">{story.category}</span>
                        </div>
                      </div>
                    </div>
                    <h2 className="text-xl font-medium text-neutral-900 mb-2">{story.title}</h2>
                    <p className="text-neutral-600 leading-relaxed max-w-none line-clamp-3">
                      {story.contentSections?.situationBefore || 'No preview available.'}
                    </p>
                    <button className="mt-4 text-sm font-medium text-neutral-900 hover:underline">
                      Read full story →
                    </button>
                  </article>
                ))
              )}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="hidden lg:block w-80 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm">
              <h3 className="font-medium text-neutral-900 mb-4">Trending Topics</h3>
              <div className="space-y-3">
                <div className="text-sm cursor-pointer group">
                  <span className="font-medium text-neutral-900 group-hover:underline">#career-pivot</span>
                  <div className="text-neutral-500 text-xs mt-0.5">120 stories</div>
                </div>
                <div className="text-sm cursor-pointer group">
                  <span className="font-medium text-neutral-900 group-hover:underline">#first-100k</span>
                  <div className="text-neutral-500 text-xs mt-0.5">85 stories</div>
                </div>
                <div className="text-sm cursor-pointer group">
                  <span className="font-medium text-neutral-900 group-hover:underline">#morning-routine</span>
                  <div className="text-neutral-500 text-xs mt-0.5">64 stories</div>
                </div>
              </div>
            </div>

            <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 text-emerald-900">
              <h3 className="font-medium mb-2">Write your first story</h3>
              <p className="text-sm text-emerald-800/80 mb-4 leading-relaxed">
                Your experiences could be exactly what someone else needs to hear today.
              </p>
              <Link to="/create" className="bg-emerald-900 text-white w-full py-2 rounded-xl text-sm font-medium hover:bg-emerald-800 transition-colors flex items-center justify-center">
                Start Writing
              </Link>
            </div>
            
            <footer className="text-xs text-neutral-400 space-x-3 text-center">
              <a href="#" className="hover:text-neutral-600 transition-colors">About</a>
              <a href="#" className="hover:text-neutral-600 transition-colors">Terms</a>
              <a href="#" className="hover:text-neutral-600 transition-colors">Privacy</a>
              <br />
              <span className="mt-2 block">© 2026 Experience Library</span>
            </footer>
          </aside>

        </div>
      </main>
    </div>
  );
}
