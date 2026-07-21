import { useState } from 'react';
import {
  Star,
  Archive,
  Trash2,
  Bell,
  Settings,
  Plus,
  ChevronDown,
  ChevronRight,
  Hash,
  FileText,
  PanelLeft,
} from 'lucide-react';

const Sidebar = () => {
  const [workspaceOpen, setWorkspaceOpen] = useState(true);

  const recentNotes = [
    'Designing for Real People',
    '10 Minute Writing Sprint',
    'Day 14 - Stream of Consciousness',
    'Smart Tagging UX',
    'Color Token Exploration',
  ];

  return (
    <aside className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col text-sm">
      {/* Top bar with traffic lights */}
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-400" />
          <span className="w-3 h-3 rounded-full bg-yellow-400" />
          <span className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          <PanelLeft size={16} />
        </button>
      </div>

      {/* Quick links */}
      <nav className="px-3 space-y-0.5">
        <SidebarLink icon={<Star size={16} />} label="Starred" count={7} />
        <SidebarLink icon={<Archive size={16} />} label="Archive" count={6} />
        <SidebarLink icon={<Trash2 size={16} />} label="Trash" count={9} />
      </nav>

      <div className="px-3 mt-4 space-y-0.5">
        <SidebarLink icon={<Bell size={16} />} label="Notifications" count={6} badge />
        <SidebarLink icon={<Settings size={16} />} label="Settings" />
      </div>

      {/* Workspace */}
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
            <button className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-gray-100 text-gray-600">
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

      {/* Recent notes */}
      <div className="px-3 mt-6 flex-1 overflow-y-auto">
        <p className="text-xs font-medium text-gray-400 px-2 mb-1">Recent Notes</p>
        <div className="space-y-0.5">
          {recentNotes.map((note) => (
            <button
              key={note}
              className="w-full text-left px-2 py-1.5 rounded-md hover:bg-gray-100 text-gray-600 truncate"
            >
              {note}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
};

const SidebarLink = ({ icon, label, count, badge }) => (
  <button className="w-full flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-gray-100 text-gray-700">
    <span className="flex items-center gap-2">
      {icon}
      {label}
    </span>
    {count !== undefined && (
      <span
        className={`text-xs px-1.5 py-0.5 rounded-full ${
          badge ? 'bg-red-500 text-white' : 'text-gray-400'
        }`}
      >
        {count}
      </span>
    )}
  </button>
);

export default Sidebar;