import { Outlet, Link, useLocation } from "react-router-dom";
import { usePageTitle } from "../../hooks/usePageTitle";
import { Icons } from "../Icons/Icons";
import "./Layout.css";

export default function Layout() {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const { title: { title, subtitle, icon, actions } } = usePageTitle();

  return (
    <div className="layout">
      <nav>
        <div className="nav-left">
          {!isHome && (<Link to="/" aria-label="Home"><Icons.ArrowLeft /></Link>)}
        </div>
        <div className="nav-center">
          {icon && <span className="nav-icon">{icon}</span>}
          {title && <h1>{title}</h1>}
          {subtitle && <h4>{subtitle}</h4>}
        </div>
        <div className="nav-right">
          {actions}
        </div>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
