import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, BookOpen, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/home');
    }
  }, [user, navigate]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-gray-50 text-gray-900 font-sans"
    >
      <nav className="flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 font-bold text-lg tracking-tight">
          <div className="w-10 h-10 bg-black rounded-[14px] flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="hidden sm:inline">Experience.</span>
        </div>
        <div className="flex gap-4 items-center text-sm font-semibold">
          {user ? (
            <Link to="/home" className="text-gray-500 hover:text-black transition-colors">Go to Feed</Link>
          ) : (
            <>
              <Link to="/login" className="text-gray-500 hover:text-black transition-colors">Log in</Link>
              <Link to="/signup" className="bg-black text-white px-6 py-2.5 rounded-full hover:bg-gray-900 transition-colors shadow-md">
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="bg-white rounded-[40px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] p-10 sm:p-16 lg:p-24 text-center sm:text-left relative overflow-hidden flex flex-col sm:flex-row items-center gap-16">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-black opacity-[0.02] rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          
          <div className="flex-1 space-y-8 relative z-10 w-full">
            <h1 className="text-5xl sm:text-7xl font-bold tracking-tight leading-[1.05] text-black">
              Uncover <br /> the Reality.
            </h1>
            <p className="text-lg sm:text-xl text-gray-500 leading-relaxed font-medium max-w-lg mx-auto sm:mx-0">
              A curated space for raw insights and documented journeys. No fluff, just the steps it took to grow.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 justify-center sm:justify-start">
              <Link to={user ? "/home" : "/signup"} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-black text-white px-8 py-4 rounded-2xl font-semibold hover:bg-gray-900 transition-all hover:-translate-y-0.5 shadow-lg">
                Join the Library
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/home" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gray-50 text-black px-8 py-4 rounded-2xl font-semibold hover:bg-gray-100 transition-all">
                Explore First
              </Link>
            </div>
          </div>
          
          <div className="hidden lg:flex w-[400px] h-[400px] bg-black rounded-[60px] rounded-tl-[100px] rounded-br-[100px] p-8 relative flex-shrink-0 flex-col justify-end text-white shadow-2xl">
            {/* Minimal pattern */}
            <div className="absolute inset-x-0 top-0 h-48 opacity-20 bg-[radial-gradient(circle_at_50%_50%,_#ffffff_10%,_transparent_20%)] bg-[length:40px_40px]" />
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-6">
                 <Sparkles className="w-6 h-6 text-black" />
              </div>
              <h3 className="text-3xl font-bold mb-2 tracking-tight">Structured Truth.</h3>
              <p className="text-gray-400 font-medium text-sm">Read lessons that save you years.</p>
            </div>
          </div>
        </div>


      </main>
    </motion.div>
  );
}
