import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, X, BookOpen, Clock } from 'lucide-react';
import { collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';

interface Suggestion {
  id: string;
  title: string;
  authorName: string;
  category: string;
}

export default function SearchBar() {
  const [queryText, setQueryText] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!queryText.trim() || queryText.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, 'stories'),
          where('title', '>=', queryText),
          where('title', '<=', queryText + '\uf8ff'),
          limit(6)
        );
        
        const snapshot = await getDocs(q);
        const results = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Suggestion));
        
        setSuggestions(results);
        setIsOpen(true);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [queryText]);

  const handleSelect = (id: string) => {
    navigate(`/story/${id}`);
    setQueryText('');
    setIsOpen(false);
  };

  return (
    <div className="relative flex-1 max-w-lg mx-auto" ref={dropdownRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          {loading ? (
            <Loader2 className="h-4 w-4 text-gray-500 animate-spin" />
          ) : (
            <Search className="h-4 w-4 text-gray-400 group-focus-within:text-gray-900 transition-colors" />
          )}
        </div>
        <input
          type="text"
          className="w-full pl-11 pr-11 py-3 bg-gray-50/80 border border-gray-100 rounded-full focus:bg-white focus:ring-4 focus:ring-gray-100/50 focus:border-gray-200 transition-all text-sm sm:text-base outline-none placeholder:text-gray-400 font-medium text-gray-900 shadow-inner"
          placeholder="Search by title, experience..."
          value={queryText}
          onChange={(e) => {
            setQueryText(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => queryText.length >= 2 && setIsOpen(true)}
        />
        {queryText && (
          <button 
            onClick={() => {
              setQueryText('');
              setSuggestions([]);
            }}
            className="absolute inset-y-0 right-4 flex items-center text-gray-400 hover:text-gray-900 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {isOpen && (queryText.length >= 2) && (
        <div className="absolute z-50 mt-3 w-full bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.08)] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="max-h-[70vh] overflow-y-auto pt-2">
            {suggestions.length > 0 ? (
              <div className="p-2 space-y-1">
                <div className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Clock className="w-3 h-3" />
                  Top Suggestions
                </div>
                {suggestions.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    className="w-full text-left p-4 hover:bg-gray-50 rounded-2xl flex items-center gap-4 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0 group-hover:bg-white transition-colors border border-gray-100 shadow-sm shadow-gray-100/50 group-hover:shadow-md">
                      <BookOpen className="w-5 h-5 text-gray-400 group-hover:text-black transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-gray-900 truncate group-hover:text-black transition-colors">
                        {item.title}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                        <span className="font-semibold text-black">{item.category}</span>
                        <span className="opacity-30">•</span>
                        <span>{item.authorName}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="px-6 py-12 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-[20px] flex items-center justify-center mx-auto mb-4 border border-gray-100 shadow-sm">
                  <Search className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">No results found</h3>
                <p className="text-sm text-gray-500 mt-1">Try different keywords or check spelling.</p>
              </div>
            )}
          </div>
          <div className="p-4 bg-gray-50/50 border-t border-gray-100">
            <p className="text-[10px] text-center font-bold text-gray-400 uppercase tracking-widest">
              Search by title
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
