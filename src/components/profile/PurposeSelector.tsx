import React from 'react';

const PURPOSES = [
  'Helping Others',
  'Inspiring People',
  'Sharing Lessons',
  'Documenting My Journey',
  'Warning Others',
  'Building Accountability',
  'Motivating Beginners',
  'Custom'
];

interface Props {
  purpose: string;
  setPurpose: (val: string) => void;
  customPurpose: string;
  setCustomPurpose: (val: string) => void;
}

export default function PurposeSelector({ purpose, setPurpose, customPurpose, setCustomPurpose }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {PURPOSES.map(p => (
          <button
            key={p}
            type="button"
            onClick={() => setPurpose(p)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all border ${
              purpose === p 
                ? 'bg-black text-white border-black' 
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            {p}
          </button>
        ))}
      </div>
      
      {purpose === 'Custom' && (
        <textarea
          value={customPurpose}
          onChange={(e) => setCustomPurpose(e.target.value)}
          placeholder="I am sharing my experiences because..."
          rows={2}
          className="w-full mt-2 px-4 py-3 bg-[#F0F2F5] border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all text-sm font-medium text-gray-900"
          autoFocus
        />
      )}
    </div>
  );
}
