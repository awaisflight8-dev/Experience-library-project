import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, TrendingUp, Sparkles, Target } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function LandingPage() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans selection:bg-neutral-200">
      <nav className="flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 font-medium text-lg tracking-tight">
          <BookOpen className="w-5 h-5" />
          Experience Library
        </div>
        <div className="flex gap-4 items-center text-sm font-medium">
          {user ? (
            <Link to="/home" className="text-neutral-600 hover:text-neutral-900 transition-colors">Go to Feed</Link>
          ) : (
            <>
              <Link to="/login" className="text-neutral-600 hover:text-neutral-900 transition-colors">Log in</Link>
              <Link to="/signup" className="bg-neutral-900 text-white px-4 py-2 rounded-lg hover:bg-neutral-800 transition-colors">
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-24 pb-32">
        <div className="max-w-3xl space-y-8">
          <h1 className="text-5xl sm:text-6xl font-medium tracking-tight leading-[1.1] text-neutral-900">
            Learn from real people's <br className="hidden sm:block" />
            experiences.
          </h1>
          <p className="text-xl text-neutral-600 leading-relaxed max-w-2xl">
            Discover real stories about money, habits, growth, and success from people around the world. A structured library of life lessons.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Link to={user ? "/home" : "/signup"} className="inline-flex items-center gap-2 bg-neutral-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-neutral-800 transition-all hover:scale-[1.02] active:scale-[0.98]">
              Start Sharing
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/home" className="inline-flex items-center gap-2 bg-white border border-neutral-200 text-neutral-900 px-6 py-3 rounded-xl font-medium hover:bg-neutral-50 transition-all">
              Explore Stories
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-32">
          <FeatureCard 
            icon={<TrendingUp className="w-5 h-5" />}
            title="Money" 
            description="Real financial journeys, successes, and hard-learned money lessons." 
            color="bg-emerald-50 text-emerald-900" 
          />
          <FeatureCard 
            icon={<Target className="w-5 h-5" />}
            title="Habits" 
            description="The daily routines and systems that compound over time to create results." 
            color="bg-blue-50 text-blue-900"
          />
          <FeatureCard 
            icon={<Sparkles className="w-5 h-5" />}
            title="Growth & Success" 
            description="Personal breakthroughs, career pivots, and stories of overcoming failure." 
            color="bg-purple-50 text-purple-900"
          />
        </div>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, description, color }: { icon: React.ReactNode, title: string, description: string, color: string }) {
  return (
    <div className="p-8 rounded-2xl bg-white border border-neutral-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-6 ${color}`}>
        {icon}
      </div>
      <h3 className="text-xl font-medium text-neutral-900 mb-3">{title}</h3>
      <p className="text-neutral-600 leading-relaxed text-sm">{description}</p>
    </div>
  );
}
