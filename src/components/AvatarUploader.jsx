import { useState, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';

const AVATAR_BASE_URL = 'http://localhost:5000';

export default function AvatarUploader({ size = 'lg', name = '', className = '' }) {
  const { user, uploadAvatar } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const avatarUrl = user?.avatar_url ? `${AVATAR_BASE_URL}${user.avatar_url}` : null;

  const sizeClasses = {
    sm: 'h-10 w-10',
    md: 'h-14 w-14',
    lg: 'h-24 w-24',
    xl: 'h-32 w-32',
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');

    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      setError('Format d\'image non supporté (JPG, PNG, WebP, GIF requis)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image trop lourde (max 5 MB)');
      return;
    }

    setUploading(true);
    try {
      await uploadAvatar(file);
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'upload de la photo');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <div className="relative">
        <div className={`${sizeClasses[size]} rounded-full overflow-hidden ring-4 ring-primary/20 bg-gradient-to-br from-primary to-green-600 flex items-center justify-center text-white font-bold shadow-lg ${uploading ? 'opacity-60' : ''}`}>
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={name || 'Photo de profil'}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="material-symbols-outlined">person</span>
          )}
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
              <span className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent" />
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full bg-primary hover:bg-[#1b4c00] text-white shadow-lg border-2 border-white transition-all disabled:opacity-60 hover:scale-105"
          title="Changer la photo de profil"
        >
          <span className="material-symbols-outlined text-base">{uploading ? 'hourglass_empty' : 'photo_camera'}</span>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {error && (
        <p className="text-xs font-bold text-red-600 text-center">{error}</p>
      )}
      {!error && (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="text-xs font-bold text-primary hover:underline"
        >
          {avatarUrl ? 'Changer la photo' : 'Ajouter une photo'}
        </button>
      )}
    </div>
  );
}