import { useState, useRef, useEffect, useContext } from 'react';
import { LogOut, User } from 'lucide-react';
import { AuthContext } from '../context/AuthContextStore';
import { getMe } from '../api/user';
import { AVATARS } from '../constants/avatars';

const ProfileMenu = () => {
  const { user, logout } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const [avatar, setAvatar] = useState('fox');
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchAvatar = async () => {
      try {
        const res = await getMe();
        setAvatar(res.data.avatar);
      } catch (err) {
        console.error('Failed to fetch avatar', err);
      }
    };
    fetchAvatar();
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-lg hover:bg-purple-200 transition-colors"
      >
        {AVATARS[avatar] || '🦊'}
      </button>

      {open && (
        <div className="absolute right-0 top-11 bg-white border border-gray-200 rounded-xl shadow-lg w-56 py-2 z-20">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>

          <button
            disabled
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-400 cursor-not-allowed mt-1"
          >
            <User size={14} />
            Profile settings
            <span className="ml-auto text-[10px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-full">
              soon
            </span>
          </button>

          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 mt-1"
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;