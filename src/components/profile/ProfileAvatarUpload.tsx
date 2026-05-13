import React, { useState, useRef } from 'react';
import { Camera, Loader2, User } from 'lucide-react';

interface Props {
  userId: string;
  currentImage: string | null;
  onUpload: (url: string) => void;
}

export default function ProfileAvatarUpload({ userId, currentImage, onUpload }: Props) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.');
      return;
    }

    setUploading(true);
    try {
      // Compress and resize the image
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 200;
          const MAX_HEIGHT = 200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          // Convert to base64
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          onUpload(dataUrl);
          setUploading(false);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-6">
       <div className="relative w-24 h-24 rounded-full border border-gray-200 bg-[#E4E6EB] flex items-center justify-center overflow-hidden shrink-0">
          {currentImage ? (
            <img src={currentImage} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <User className="w-10 h-10 text-gray-400" />
          )}
          {uploading && (
             <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
               <Loader2 className="w-6 h-6 text-white animate-spin" />
             </div>
          )}
       </div>
       <div>
         <input 
           type="file" 
           accept="image/*" 
           ref={fileInputRef} 
           onChange={handleFileChange} 
           className="hidden" 
         />
         <button 
           type="button" 
           onClick={() => fileInputRef.current?.click()}
           disabled={uploading}
           className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
         >
           <Camera className="w-4 h-4" />
           {currentImage ? 'Change Photo' : 'Upload Photo'}
         </button>
         <p className="text-xs text-gray-500 mt-2 font-medium">JPEG, PNG or GIF (max 5MB)</p>
       </div>
    </div>
  );
}
