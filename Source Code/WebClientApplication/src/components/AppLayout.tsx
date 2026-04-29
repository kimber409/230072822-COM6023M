import { NavLink, Outlet } from 'react-router-dom';
import { BriefcaseBusiness, CalendarClock, Check, LayoutDashboard, LogOut, Settings, UsersRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/candidates', label: 'Candidates', icon: UsersRound },
  { to: '/jobs', label: 'Jobs', icon: BriefcaseBusiness },
  { to: '/applications', label: 'Applications', icon: Check },
  { to: '/interviews', label: 'Interviews', icon: CalendarClock },
  { to: '/settings', label: 'Settings', icon: Settings }
];

// Main protected layout with sidebar navigation.
export function AppLayout() {
  const { user, signOut } = useAuth();

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <p className="eyebrow">RecruitFlow</p>
          <h1>Hiring pipeline</h1>
          <span>{user?.name ?? 'Recruiter'}</span>
        </div>
        <nav aria-label="Primary navigation">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === '/'}>
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <button className="ghost-button" type="button" onClick={signOut}><LogOut size={18} /> Sign out</button>
      </aside>
      <section className="workspace">
        <Outlet />
      </section>
    </main>
  );
}
