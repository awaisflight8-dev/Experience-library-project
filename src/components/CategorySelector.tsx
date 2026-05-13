import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search, X } from 'lucide-react';
import { CATEGORIES } from '../constants/categories';

interface CategorySelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function CategorySelector({ value, onChange }: CategorySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredCategories = CATEGORIES.filter(cat => 
    cat.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-transparent px-4 py-4 focus:outline-none text-left flex items-center justify-between transition-colors group rounded-2xl hover:bg-black/5"
      >
        <span className={`text-sm font-semibold truncate ${value ? 'text-gray-900' : 'text-gray-400'}`}>
          {value || 'Select category...'}
        </span>
        <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180 text-black' : 'text-gray-400 group-hover:text-gray-600'}`} />
      </button>

      {isOpen && (
        <div className="absolute z-20 mt-3 w-full bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-[24px] overflow-hidden transform origin-top animate-in fade-in slide-in-from-top-2">
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                autoFocus
                type="text"
                placeholder="Search categories..."
                className="w-full pl-11 pr-10 py-3 bg-gray-50 border border-transparent rounded-[16px] text-sm font-medium focus:outline-none focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-gray-50 text-black placeholder:text-gray-400 transition-all"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto p-2 space-y-1">
            {filteredCategories.length > 0 ? (
              filteredCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    onChange(cat);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  className={`w-full px-4 py-3 text-left flex items-center justify-between transition-colors rounded-[16px] ${
                    value === cat 
                      ? 'bg-black text-white' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className={`text-sm ${value === cat ? 'font-bold' : 'font-medium'}`}>
                    {cat}
                  </span>
                  {value === cat && (
                    <Check className="w-4 h-4 text-white" />
                  )}
                </button>
              ))
            ) : (
              <div className="px-6 py-10 text-center">
                <p className="text-sm font-medium text-gray-400">No match found</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
