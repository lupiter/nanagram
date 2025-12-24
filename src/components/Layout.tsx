import { Outlet, Link, useLocation } from 'react-router-dom';
import './Layout.css';

export default function Layout() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="layout">
      <nav>
        {!isHome && <Link to="/">Home</Link>}
        {isHome && <Link to="/designer">Designer</Link>}
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
} 