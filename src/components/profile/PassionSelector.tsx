import React, { useState } from 'react';

const COMMON_PASSIONS = [
  'Video Editing',
  'Freelancing',
  'Self Improvement',
  'Entrepreneurship',
  'Student',
  'Fitness',
  'Programming',
  'Content Creation',
  'Design',
  'Marketing'
];

interface Props {
  value: string;
  onChange: (val: string) => void;
}

export default function PassionSelector({ value, onChange }: Props) {
  const [isCustom, setIsCustom] = useState(false);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === 'custom') {
      setIsCustom(true);
      onChange('');
    } else {
      setIsCustom(false);
      onChange(e.target.value);
    }
  };

  return (
    <div className="space-y-3">
      {!isCustom ? (
        <select
          value={value}
          onChange={handleSelectChange}
          className="w-full px-4 py-3 bg-[#F0F2F5] border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all text-sm font-medium text-gray-900 appearance-none"
        >
          <option value="" disabled>Select your passion/field</option>
          {COMMON_PASSIONS.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
          <option value="custom">Other (Custom)</option>
        </select>
      ) : (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Type your passion..."
            className="flex-1 px-4 py-3 bg-[#F0F2F5] border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all text-sm font-medium text-gray-900"
            autoFocus
          />
          <button
            type="button"
            onClick={() => { setIsCustom(false); onChange(''); }}
            className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-semibold transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
