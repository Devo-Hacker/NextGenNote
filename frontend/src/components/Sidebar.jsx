import {
  Star, Archive, Trash2, Bell, Settings, Plus,
  ChevronDown, ChevronRight, Hash, FileText,
  PanelLeft, PanelLeftClose, X, Network,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({
  activeView, onViewChange, counts, recentNotes, onOpenRecent,
  collapsed, onToggleCollapse, notificationCount, onNotificationsClick,
  collections, onNewWorkspace, onDeleteCollection,
}) => {
  const [workspaceOpen, setWorkspaceOpen] = useState(true);
  const navigate = useNavigate();

  return (
    <aside
      className={`h-screen bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 flex flex-col text-sm transition-all duration-300 ease-in-out overflow-hidden ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className={`flex items-center py-4 ${collapsed ? 'justify-center px-2' : 'justify-between px-4'}`}>
        {!collapsed && (
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-400" />
            <span className="w-3 h-3 rounded-full bg-yellow-400" />
            <span className="w-3 h-3 rounded-full bg-green-400" />
          </div>
        )}
        <button onClick={onToggleCollapse} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
          {collapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={16} />}
        </button>
      </div>

      <nav className={`space-y-0.5 ${collapsed ? 'px-2' : 'px-3'}`}>
        <SidebarLink icon={<Star size={16} />} label="Starred" count={counts.starred}
          collapsed={collapsed} active={activeView === 'starred'} onClick={() => onViewChange('starred')} />
        <SidebarLink icon={<Archive size={16} />} label="Archive" count={counts.archive}
          collapsed={collapsed} active={activeView === 'archive'} onClick={() => onViewChange('archive')} />
        <SidebarLink icon={<Trash2 size={16} />} label="Trash" count={counts.trash}
          collapsed={collapsed} active={activeView === 'trash'} onClick={() => onViewChange('trash')} />
      </nav>

      <div className={`mt-4 space-y-0.5 ${collapsed ? 'px-2' : 'px-3'}`}>
        <SidebarLink
          icon={<Bell size={16} />}
          label="Notifications"
          dot={notificationCount > 0}
          collapsed={collapsed}
          onClick={onNotificationsClick}
        />
        <SidebarLink icon={<Settings size={16} />} label="Settings" collapsed={collapsed} onClick={() => navigate('/settings')} />
      </div>

      {!collapsed && (
        <>
          <div className="px-3 mt-6">
            <p className="text-[11px] font-semibold tracking-wide text-gray-400 dark:text-gray-500 uppercase px-2 mb-1.5">
              Workspace
            </p>
            <button
              onClick={() => setWorkspaceOpen((prev) => !prev)}
              className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800/60 text-gray-700 dark:text-gray-300"
            >
              {workspaceOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              <Hash size={14} />
              <span>NextGenNote</span>
            </button>

            {workspaceOpen && (
              <div className="mt-1 space-y-0.5">
                <button
                  onClick={() => onViewChange('all')}
                  className={`w-full flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-md border-l-2 transition-colors ${
                    activeView === 'all'
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 font-medium'
                      : 'border-transparent hover:bg-gray-100 dark:hover:bg-gray-800/60 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <FileText size={14} />
                  <span>All Notes</span>
                </button>

                {collections.map((c) => (
                  <div key={c._id} className="group relative flex items-center">
                    <button
                      onClick={() => onViewChange(`collection:${c._id}`)}
                      className={`w-full flex items-center gap-2 pl-3 pr-7 py-1.5 rounded-md border-l-2 transition-colors ${
                        activeView === `collection:${c._id}`
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-500/10 font-medium'
                          : 'border-transparent hover:bg-gray-100 dark:hover:bg-gray-800/60'
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                      <span className="truncate text-gray-600 dark:text-gray-400">{c.name}</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteCollection(c);
                      }}
                      title="Delete collection"
                      className="absolute right-1 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 p-1 rounded transition-opacity"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={onNewWorkspace}
              className="w-full flex items-center gap-1.5 px-2 py-1.5 mt-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800/60 text-gray-500 dark:text-gray-400"
            >
              <Plus size={14} />
              <span>New workspace</span>
            </button>
          </div>

          <div className="px-3 mt-4">
            <button
              onClick={() => navigate('/connections')}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800/60 text-gray-700 dark:text-gray-300"
            >
              <Network size={16} />
              <span>Connecting Thoughts</span>
            </button>
          </div>

          <div className="px-3 mt-6 flex-1 overflow-y-auto">
            <p className="text-[11px] font-semibold tracking-wide text-gray-400 dark:text-gray-500 uppercase px-2 mb-1.5">
              Recent Notes
            </p>
            <div className="space-y-0.5">
              {recentNotes.length === 0 && (
                <p className="text-xs text-gray-300 dark:text-gray-600 px-2">No recent notes yet</p>
              )}
              {recentNotes.map((note) => (
                <button
                  key={note._id}
                  onClick={() => onOpenRecent(note)}
                  className="w-full text-left px-2 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800/60 text-gray-600 dark:text-gray-400 truncate"
                >
                  {note.title || 'Untitled'}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </aside>
  );
};

const SidebarLink = ({ icon, label, count, dot, collapsed, active, onClick }) => (
  <button
    onClick={onClick}
    title={collapsed ? label : undefined}
    className={`w-full flex items-center rounded-md transition-colors relative ${
      collapsed ? 'justify-center py-2' : 'justify-between px-2 py-1.5'
    } ${
      active
        ? 'bg-gray-100 dark:bg-gray-800/60 text-gray-900 dark:text-white font-medium'
        : 'hover:bg-gray-100 dark:hover:bg-gray-800/60 text-gray-700 dark:text-gray-300'
    }`}
  >
    <span className="flex items-center gap-2 relative">
      {icon}
      {dot && (
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500 border border-white dark:border-gray-950" />
      )}
      {!collapsed && label}
    </span>
    {!collapsed && count !== undefined && count > 0 && (
      <span className="text-xs text-gray-400 dark:text-gray-500">{count}</span>
    )}
  </button>
);

export default Sidebar;