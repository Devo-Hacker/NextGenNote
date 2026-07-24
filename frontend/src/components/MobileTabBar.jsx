import { useState } from 'react';
import {
  Home, Sparkles, Bell, Menu, X,
  Star, Archive, Trash2, Settings, Network, Plus, Hash,
} from 'lucide-react';

const MobileTabBar = ({
  activeView, onViewChange, counts, notificationCount,
  onNotificationsClick, onAICanvasClick, collections,
  onNewWorkspace, onSettingsClick, onConnectionsClick,
}) => {
  const [moreOpen, setMoreOpen] = useState(false);

  const go = (view) => {
    onViewChange(view);
    setMoreOpen(false);
  };

  return (
    <>
      {/* Bottom bar */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 flex items-center justify-around px-2 py-2">
        <TabButton
          icon={<Home size={20} />}
          label="Notes"
          active={activeView === 'all'}
          onClick={() => go('all')}
        />
        <TabButton
          icon={<Sparkles size={20} />}
          label="AI"
          onClick={onAICanvasClick}
        />
        <TabButton
          icon={<Bell size={20} />}
          label="Alerts"
          dot={notificationCount > 0}
          onClick={onNotificationsClick}
        />
        <TabButton
          icon={moreOpen ? <X size={20} /> : <Menu size={20} />}
          label="More"
          active={moreOpen}
          onClick={() => setMoreOpen((prev) => !prev)}
        />
      </nav>

      {/* More sheet */}
      {moreOpen && (
        <div className="sm:hidden fixed inset-0 z-30" onClick={() => setMoreOpen(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-16 left-0 right-0 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 rounded-t-2xl p-4 max-h-[65vh] overflow-y-auto"
          >
            <div className="w-10 h-1 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mb-4" />

            <div className="grid grid-cols-3 gap-2 mb-4">
              <SheetIcon icon={<Star size={18} />} label="Starred" count={counts.starred} onClick={() => go('starred')} />
              <SheetIcon icon={<Archive size={18} />} label="Archive" count={counts.archive} onClick={() => go('archive')} />
              <SheetIcon icon={<Trash2 size={18} />} label="Trash" count={counts.trash} onClick={() => go('trash')} />
            </div>

            <p className="text-[11px] font-semibold tracking-wide text-gray-400 dark:text-gray-500 uppercase mb-2 px-1">
              Workspace
            </p>
            <div className="space-y-0.5 mb-3">
              <button
                onClick={() => go('all')}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Hash size={14} />
                All Notes
              </button>
              {collections.map((c) => (
                <button
                  key={c._id}
                  onClick={() => go(`collection:${c._id}`)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                  {c.name}
                </button>
              ))}
              <button
                onClick={() => { onNewWorkspace(); setMoreOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Plus size={14} />
                New workspace
              </button>
            </div>

            <div className="border-t border-gray-100 dark:border-gray-800 pt-3 space-y-0.5">
              <button
                onClick={() => { onConnectionsClick(); setMoreOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Network size={16} />
                Connecting Thoughts
              </button>
              <button
                onClick={() => { onSettingsClick(); setMoreOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Settings size={16} />
                Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const TabButton = ({ icon, label, active, dot, onClick }) => (
  <button
    onClick={onClick}
    className="relative flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg"
  >
    <span className={active ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400'}>
      {icon}
      {dot && (
        <span className="absolute top-0 right-1.5 w-2 h-2 rounded-full bg-red-500 border border-white dark:border-gray-950" />
      )}
    </span>
    <span className={`text-[10px] ${active ? 'text-purple-600 dark:text-purple-400 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
      {label}
    </span>
  </button>
);

const SheetIcon = ({ icon, label, count, onClick }) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center gap-1 py-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300"
  >
    {icon}
    <span className="text-xs">{label}</span>
    {count > 0 && <span className="text-[10px] text-gray-400">{count}</span>}
  </button>
);

export default MobileTabBar;