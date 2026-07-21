import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Moon, Sun, Bell, BellOff, Check } from "lucide-react";
import { ThemeContext } from "../context/ThemeContextStore";
import { getMe, updateSettings } from "../api/user";
import { AVATARS } from "../constants/avatars";

const Settings = () => {
  const { darkMode, setDarkMode } = useContext(ThemeContext);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [avatar, setAvatar] = useState("fox");
  const [greeting, setGreeting] = useState("Hola");
  const [saved, setSaved] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await getMe();
        setNotificationsEnabled(res.data.notificationsEnabled);
        setAvatar(res.data.avatar);
        setGreeting(res.data.dashboardGreeting);
      } catch (err) {
        console.error("Failed to load settings", err);
      }
    };
    fetchSettings();
  }, []);

  const persist = async (fields) => {
    try {
      await updateSettings(fields);
      setSaved(true);
      setTimeout(() => setSaved(false), 1200);
    } catch (err) {
      console.error("Failed to save settings", err);
    }
  };

  const handleToggleDarkMode = () => {
    const newValue = !darkMode;
    setDarkMode(newValue);
    persist({ darkMode: newValue });
  };

  const handleToggleNotifications = () => {
    const newValue = !notificationsEnabled;
    setNotificationsEnabled(newValue);
    persist({ notificationsEnabled: newValue });
  };

  const handleSelectAvatar = (key) => {
    setAvatar(key);
    persist({ avatar: key });
  };

  const handleGreetingBlur = () => {
    persist({ dashboardGreeting: greeting });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-2xl mx-auto px-8 py-6">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate("/dashboard")}
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

        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-8">
          Settings
        </h1>

        {/* Appearance */}
        <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 mb-4">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">
            Appearance
          </h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              {darkMode ? <Moon size={16} /> : <Sun size={16} />}
              {darkMode ? "Dark mode" : "Light mode"}
            </div>
            <button
              onClick={handleToggleDarkMode}
              className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                darkMode ? "bg-purple-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                  darkMode ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </section>

        {/* Notifications */}
        <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 mb-4">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">
            Notifications
          </h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              {notificationsEnabled ? (
                <Bell size={16} />
              ) : (
                <BellOff size={16} />
              )}
              {notificationsEnabled ? "Notifications on" : "Notifications off"}
            </div>
            <button
              onClick={handleToggleNotifications}
              className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                notificationsEnabled ? "bg-purple-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                  notificationsEnabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </section>

        {/* Avatar */}
        <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 mb-4">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-1">
            Profile picture
          </h2>
          <p className="text-xs text-gray-400 mb-4">
            Pick an avatar for your profile
          </p>
          <div className="flex flex-wrap gap-3">
            {Object.entries(AVATARS).map(([key, emoji]) => (
              <button
                key={key}
                onClick={() => handleSelectAvatar(key)}
                className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl border-2 transition-colors ${
                  avatar === key
                    ? "border-purple-600 bg-purple-50 dark:bg-purple-900/30"
                    : "border-transparent bg-gray-100 dark:bg-gray-700 hover:border-gray-300"
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </section>

        {/* Dashboard greeting */}
        <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-1">
            Dashboard greeting
          </h2>
          <p className="text-xs text-gray-400 mb-4">
            Customize the greeting shown on your dashboard
          </p>
          <input
            type="text"
            value={greeting}
            onChange={(e) => setGreeting(e.target.value)}
            onBlur={handleGreetingBlur}
            placeholder="Hola"
            className="w-full text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2.5 outline-none focus:border-purple-400 transition-colors"
          />
        </section>
      </div>
    </div>
  );
};

export default Settings;
