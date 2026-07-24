import { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Plus, LogOut, Camera, BadgeCheck, Pencil } from 'lucide-react';
import { AuthContext } from '../context/AuthContextStore';
import { getMe, updateSettings } from '../api/user';
import { AVATARS } from '../constants/avatars';
import { getSavedAccounts, removeAccount } from '../utils/accounts';

const ProfileSettings = () => {
  const { user, updateUser, switchAccount, logout } = useContext(AuthContext);
  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState('fox');
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getMe();
        setAvatar(res.data.avatar);
        setName(res.data.name);
      } catch (err) {
        console.error('Failed to load profile', err);
      }
    };
    fetchProfile();
    setAccounts(getSavedAccounts());
  }, []);

  const handleNameChange = (e) => {
    setName(e.target.value);
    setDirty(true);
  };

  const handleSaveChanges = async () => {
    if (!name.trim()) return;
    try {
      await updateSettings({ name: name.trim() });
      updateUser({ name: name.trim() });
      setDirty(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } catch (err) {
      console.error('Failed to update name', err);
    }
  };

  const handleSwitchAccount = (account) => {
    if (account.user.email === user?.email) return;
    switchAccount(account.token, account.user);
    navigate('/dashboard');
  };

  const handleRemoveAccount = (email) => {
    if (email === user?.email) return;
    removeAccount(email);
    setAccounts(getSavedAccounts());
  };

  return (
    <div className="min-h-screen bg-[#0a0a10]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">Profile</h1>
        <p className="text-sm text-gray-500 mb-6">Manage your public identity and account settings</p>

        {/* Profile card */}
        <section className="bg-[#111118] border border-white/10 rounded-2xl p-5 sm:p-8 mb-4">
          <div className="flex flex-col items-center text-center pb-6 border-b border-white/10">
            <div className="relative mb-3">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-purple-600 to-fuchsia-500 flex items-center justify-center text-3xl sm:text-4xl">
                {AVATARS[avatar] || '🦊'}
              </div>
              <button
                onClick={() => navigate('/settings')}
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-purple-600 border-2 border-[#111118] flex items-center justify-center hover:bg-purple-700 transition-colors"
              >
                <Camera size={11} className="text-white" />
              </button>
            </div>
            <button
              onClick={() => navigate('/settings')}
              className="text-sm font-medium text-purple-400 hover:text-purple-300"
            >
              Change avatar
            </button>
          </div>

          <div className="pt-6">
            <label className="text-xs font-medium tracking-wide text-gray-500 uppercase mb-2 block">
              Display name
            </label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={handleNameChange}
                className="w-full text-sm text-white bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 pr-10 outline-none focus:border-purple-400/50 transition-colors"
              />
              <Pencil size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-4">
              <div className="flex items-center gap-1.5 text-sm text-gray-400 truncate">
                <span className="truncate">{user?.email}</span>
              </div>
              <span className="flex items-center gap-1 text-xs text-green-400 shrink-0">
                <BadgeCheck size={13} />
                Verified
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              {saved && (
                <span className="flex items-center gap-1 text-xs text-green-400">
                  <Check size={12} />
                  Saved
                </span>
              )}
              <button
                onClick={handleSaveChanges}
                disabled={!dirty}
                className="text-sm font-medium text-white bg-purple-600 rounded-lg px-4 sm:px-5 py-2 hover:bg-purple-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Save changes
              </button>
            </div>
          </div>
        </section>

        {/* Accounts */}
        <section className="bg-[#111118] border border-white/10 rounded-2xl p-4 sm:p-6">
          <h2 className="font-semibold text-white mb-1">Accounts</h2>
          <p className="text-xs text-gray-500 mb-4">Switch between accounts you've logged into on this device</p>

          <div className="space-y-2 mb-3">
            {accounts.map((account) => {
              const isActive = account.user.email === user?.email;
              return (
                <div
                  key={account.user.email}
                  onClick={() => handleSwitchAccount(account)}
                  className={`flex items-center justify-between gap-2 px-3 sm:px-4 py-3 rounded-xl cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600/90 to-fuchsia-600/80'
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center text-base shrink-0">
                      {AVATARS[account.user.avatar] || '🦊'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{account.user.name}</p>
                      <p className="text-xs text-white/60 truncate">{account.user.email}</p>
                    </div>
                  </div>
                  {isActive ? (
                    <span className="text-xs font-medium text-white bg-white/20 px-2.5 py-1 rounded-full shrink-0">
                      Active
                    </span>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveAccount(account.user.email);
                      }}
                      className="text-xs text-gray-400 hover:text-red-400 bg-white/5 px-2.5 py-1 rounded-full shrink-0"
                    >
                      Remove
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <button
            onClick={() => navigate('/login?addAccount=true')}
            className="w-full flex items-center justify-center gap-1.5 text-sm text-gray-300 bg-white/5 hover:bg-white/10 rounded-xl py-3 mb-2 transition-colors"
          >
            <Plus size={14} />
            Add another account
          </button>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-1.5 text-sm text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-xl py-3 transition-colors"
          >
            <LogOut size={14} />
            Logout
          </button>
        </section>
      </div>
    </div>
  );
};

export default ProfileSettings;