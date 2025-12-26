import { Outlet, Link, useLocation } from "react-router-dom";
import { usePageTitle } from "../hooks/usePageTitle";
import "./Layout.css";

export default function Layout() {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const { title: {title, subtitle } } = usePageTitle();

  return (
    <div className="layout">
      {!isHome && (
        <nav>
          <Link to="/" aria-label="Home">←</Link>
          {title && <h1>{title}</h1>}
          {subtitle && <h4>{subtitle}</h4>}
        </nav>
      )}
      <main>
        <Outlet />
      </main>
    </div>
  );
}
