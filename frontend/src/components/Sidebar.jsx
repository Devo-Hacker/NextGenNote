import {
  Star, Archive, Trash2, Bell, Settings, Plus,
  ChevronDown, ChevronRight, Hash, FileText,
  PanelLeft, PanelLeftClose,
} from 'lucide-react';
import { useState } from 'react';

const Sidebar = ({
  activeView, onViewChange, counts, recentNotes, onOpenRecent,
  collapsed, onToggleCollapse, notificationCount, onNotificationsClick,
}) => {
  const [workspaceOpen, setWorkspaceOpen] = useState(true);

  return (
    <aside
      className={`h-screen bg-white border-r border-gray-200 flex flex-col text-sm transition-all duration-300 ease-in-out overflow-hidden ${
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
        <button
          onClick={onToggleCollapse}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
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
          count={notificationCount}
          badge={notificationCount > 0}
          collapsed={collapsed}
          onClick={onNotificationsClick}
        />
        <SidebarLink icon={<Settings size={16} />} label="Settings" collapsed={collapsed} />
      </div>

      {!collapsed && (
        <>
          <div className="px-3 mt-6">
            <p className="text-xs font-medium text-gray-400 px-2 mb-1">Workspace</p>
            <button
              onClick={() => setWorkspaceOpen((prev) => !prev)}
              className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-gray-100 text-gray-700"
            >
              {workspaceOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              <Hash size={14} />
              <span>NextGenNote</span>
            </button>

            {workspaceOpen && (
              <div className="ml-5 mt-1 space-y-0.5">
                <button
                  onClick={() => onViewChange('all')}
                  className={`w-full flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-gray-100 ${
                    activeView === 'all' ? 'text-gray-900 bg-gray-100 font-medium' : 'text-gray-600'
                  }`}
                >
                  <FileText size={14} />
                  <span>All Notes</span>
                </button>
              </div>
            )}

            <button className="w-full flex items-center gap-1.5 px-2 py-1.5 mt-1 rounded-md hover:bg-gray-100 text-gray-500">
              <Plus size={14} />
              <span>New workspace</span>
            </button>
          </div>

          <div className="px-3 mt-6 flex-1 overflow-y-auto">
            <p className="text-xs font-medium text-gray-400 px-2 mb-1">Recent Notes</p>
            <div className="space-y-0.5">
              {recentNotes.length === 0 && (
                <p className="text-xs text-gray-300 px-2">No recent notes yet</p>
              )}
              {recentNotes.map((note) => (
                <button
                  key={note._id}
                  onClick={() => onOpenRecent(note)}
                  className="w-full text-left px-2 py-1.5 rounded-md hover:bg-gray-100 text-gray-600 truncate"
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

const SidebarLink = ({ icon, label, count, badge, collapsed, active, onClick }) => (
  <button
    onClick={onClick}
    title={collapsed ? label : undefined}
    className={`w-full flex items-center rounded-md transition-colors ${
      collapsed ? 'justify-center py-2' : 'justify-between px-2 py-1.5'
    } ${active ? 'bg-gray-100 text-gray-900 font-medium' : 'hover:bg-gray-100 text-gray-700'}`}
  >
    <span className="flex items-center gap-2">
      {icon}
      {!collapsed && label}
    </span>
    {!collapsed && count !== undefined && count > 0 && (
      <span className={`text-xs px-1.5 py-0.5 rounded-full ${badge ? 'bg-red-500 text-white' : 'text-gray-400'}`}>
        {count}
      </span>
    )}
  </button>
);

export default Sidebar;