import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';
import {
  LayoutDashboard, Users, CreditCard, Package, LogOut, Menu, X, MessageSquare, FileText,
} from 'lucide-react';
import { useState } from 'react';

const NAV = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/merchants', icon: Users, label: 'Marchands' },
  { to: '/plans', icon: Package, label: 'Plans' },
  { to: '/subscriptions', icon: CreditCard, label: 'Abonnements' },
  { to: '/messaging', icon: MessageSquare, label: 'Messagerie' },
  { to: '/templates', icon: FileText, label: 'Templates' },
];

export default function Layout() {
  const { fullName, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-primary-800 text-white transform transition-transform lg:translate-x-0 lg:static
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center gap-3 px-6 py-5 border-b border-primary-700">
          <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center font-bold text-lg">T</div>
          <span className="font-bold text-lg tracking-tight">TissuGest Admin</span>
        </div>
        <nav className="mt-4 px-3 space-y-1">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === '/'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${isActive ? 'bg-white/15 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}`
              }
            >
              <n.icon size={18} />
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-primary-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
              {fullName?.[0]?.toUpperCase() ?? 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{fullName ?? 'Admin'}</p>
              <p className="text-xs text-white/50">Administrateur</p>
            </div>
            <button onClick={logout} className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white" title="Déconnexion">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay mobile */}
      {sidebarOpen && <div className="fixed inset-0 z-20 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4 lg:px-8">
          <button className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <h1 className="text-lg font-semibold text-gray-800">Administration</h1>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
