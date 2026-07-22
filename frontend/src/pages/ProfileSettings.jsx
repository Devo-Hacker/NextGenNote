import { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Plus, LogOut } from 'lucide-react';
import { AuthContext } from '../context/AuthContextStore';
import { getMe, updateSettings } from '../api/user';
import { AVATARS } from '../constants/avatars';
import { getSavedAccounts, removeAccount } from '../utils/accounts';

const ProfileSettings = () => {
  const { user, updateUser, switchAccount, logout } = useContext(AuthContext);
  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState('fox');
  const [saved, setSaved] = useState(false);
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

  const handleSaveName = async () => {
    if (!name.trim() || name === user?.name) return;
    try {
      await updateSettings({ name: name.trim() });
      updateUser({ name: name.trim() });
      setSaved(true);
      setTimeout(() => setSaved(false), 1200);
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-xl mx-auto px-8 py-6">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            Back
          </button>
          {saved && (
            <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
              <Check size={12} />
              Saved
            </span>
          )}
        </div>

        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-8">Profile</h1>

        {/* Big avatar + name */}
        <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-4 flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center text-5xl mb-4">
            {AVATARS[avatar] || '🦊'}
          </div>
          <button
            onClick={() => navigate('/settings')}
            className="text-xs text-purple-600 dark:text-purple-400 hover:underline mb-6"
          >
            Change avatar
          </button>

          <div className="w-full max-w-xs">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block text-left">
              Display name
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={handleSaveName}
                onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
                className="flex-1 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2.5 outline-none focus:border-purple-400 transition-colors"
              />
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{user?.email}</p>
          </div>
        </section>

        {/* Accounts */}
        <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-1">Accounts</h2>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
            Switch between accounts you've logged into on this device
          </p>

          <div className="space-y-2 mb-4">
            {accounts.map((account) => {
              const isActive = account.user.email === user?.email;
              return (
                <div
                  key={account.user.email}
                  onClick={() => handleSwitchAccount(account)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg border cursor-pointer transition-colors ${
                    isActive
                      ? 'border-purple-300 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-700'
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center text-lg">
                      {AVATARS[account.user.avatar] || '🦊'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{account.user.name}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{account.user.email}</p>
                    </div>
                  </div>
                  {isActive ? (
                    <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">Active</span>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveAccount(account.user.email);
                      }}
                      className="text-xs text-gray-400 hover:text-red-500"
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
            className="w-full flex items-center justify-center gap-1.5 text-sm text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800 rounded-lg py-2.5 hover:bg-purple-50 dark:hover:bg-purple-900/20 mb-2"
          >
            <Plus size={14} />
            Add another account
          </button>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-1.5 text-sm text-red-500 border border-red-200 dark:border-red-900 rounded-lg py-2.5 hover:bg-red-50 dark:hover:bg-red-950"
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