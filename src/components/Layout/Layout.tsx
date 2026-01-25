import { Outlet, Link, useLocation } from "react-router-dom";
import { usePageTitle } from "../../hooks/usePageTitle";
import { Icons } from "../Icons/Icons";
import "./Layout.css";

export default function Layout() {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const { title: {title, subtitle } } = usePageTitle();

  return (
    <div className="layout">
      
        <nav>
        {!isHome && (<Link to="/" aria-label="Home"><Icons.ArrowLeft /></Link>)}
          {title && <h1>{title}</h1>}
          {subtitle && <h4>{subtitle}</h4>}
        </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
