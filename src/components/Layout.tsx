import { Outlet, Link, useLocation } from "react-router-dom";
import "./Layout.css";

export default function Layout() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <div className="layout">
      {!isHome && (
        <nav>
          <Link to="/" aria-label="Home">←</Link>
        </nav>
      )}
      <main>
        <Outlet />
      </main>
    </div>
  );
}
