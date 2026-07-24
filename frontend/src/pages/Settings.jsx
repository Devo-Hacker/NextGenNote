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
    <div className="min-h-screen bg-[#0a0710] relative overflow-hidden transition-colors">
      <style>{`
        .settings-glow {
          position: absolute;
          border-radius: 9999px;
          filter: blur(100px);
          pointer-events: none;
        }
        .settings-panel {
          background: rgba(168, 85, 247, 0.06);
          border: 1px solid rgba(168, 85, 247, 0.15);
          backdrop-filter: blur(14px);
        }
        .settings-field {
          background: rgba(168, 85, 247, 0.08);
          border: 1px solid rgba(168, 85, 247, 0.18);
        }
        .settings-toggle-on {
          background: linear-gradient(135deg, #a855f7 0%, #7e22ce 100%);
          box-shadow: 0 0 12px rgba(168, 85, 247, 0.5);
        }
      `}</style>

      <div className="settings-glow w-[220px] h-[220px] sm:w-[420px] sm:h-[420px] bg-purple-700/25 -top-24 -left-24" />
      <div className="settings-glow w-[200px] h-[200px] sm:w-[360px] sm:h-[360px] bg-fuchsia-700/15 bottom-0 right-0" />

      <div className="relative max-w-2xl mx-auto px-4 sm:px-8 py-5 sm:py-6">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            Back
          </button>
          {saved && (
            <span className="flex items-center gap-1 text-xs text-purple-300">
              <Check size={12} />
              Saved
            </span>
          )}
        </div>

        <h1 className="text-xl sm:text-2xl font-semibold text-white mb-6 sm:mb-8">
          Settings
        </h1>

        <div className="space-y-4">
          {/* Dashboard greeting */}
          <section className="settings-panel rounded-xl p-4 sm:p-5">
            <h2 className="font-semibold text-white mb-1">
              Dashboard greeting
            </h2>
            <p className="text-xs text-purple-200/50 mb-4">
              Customize the greeting shown on your dashboard
            </p>
            <input
              type="text"
              value={greeting}
              onChange={(e) => setGreeting(e.target.value)}
              onBlur={handleGreetingBlur}
              placeholder="Hola"
              className="settings-field w-full text-sm text-white rounded-lg px-3 py-2.5 outline-none placeholder-purple-200/30 focus:border-purple-400 transition-colors"
            />
          </section>

          {/* Avatar */}
          <section className="settings-panel rounded-xl p-4 sm:p-5">
            <h2 className="font-semibold text-white mb-1">
              Profile picture
            </h2>
            <p className="text-xs text-purple-200/50 mb-4">
              Pick an avatar for your profile
            </p>
            <div className="flex flex-wrap gap-2.5 sm:gap-3">
              {Object.entries(AVATARS).map(([key, emoji]) => (
                <button
                  key={key}
                  onClick={() => handleSelectAvatar(key)}
                  className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-xl sm:text-2xl border-2 transition-colors ${
                    avatar === key
                      ? "border-purple-400 bg-purple-500/20 shadow-[0_0_12px_rgba(168,85,247,0.5)]"
                      : "border-transparent bg-white/5 hover:border-purple-500/40"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </section>

          {/* Appearance */}
          <section className="settings-panel rounded-xl p-4 sm:p-5">
            <h2 className="font-semibold text-white mb-4">
              Appearance
            </h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-purple-100/80">
                {darkMode ? <Moon size={16} /> : <Sun size={16} />}
                {darkMode ? "Dark mode" : "Light mode"}
              </div>
              <button
                onClick={handleToggleDarkMode}
                className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                  darkMode ? "settings-toggle-on" : "bg-white/10"
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
          <section className="settings-panel rounded-xl p-4 sm:p-5">
            <h2 className="font-semibold text-white mb-4">
              Notifications
            </h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-purple-100/80">
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
                  notificationsEnabled ? "settings-toggle-on" : "bg-white/10"
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
        </div>
      </div>
    </div>
  );
};

export default Settings;