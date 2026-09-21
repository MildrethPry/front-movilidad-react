import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, LogOut, Menu, UserRound, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AlertsProvider } from '../context/AlertsProvider';
import NotificationBell from './NotificationBell';
import { groupNavByModule, navForRoles, navLabel } from '../config/navigation';
import {
  ROLE_LABELS,
  homeForRoles,
  isDualConductorMechanic,
  isDualDocenteFacultad,
} from '../config/roles';

const SHORT_ROLE: Record<string, string> = {
  'Secretaría / Administrativo': 'Secretaría',
  'Responsable de Facultad': 'Facultad',
};

export default function AppShell() {
  const { user, roleIds, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [desktop, setDesktop] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(min-width: 961px)').matches
  );

  const items = useMemo(() => navForRoles(roleIds), [roleIds]);
  const grouped = useMemo(() => groupNavByModule(items), [items]);
  const home = homeForRoles(roleIds);
  const roles = roleIds
    .map((r) => SHORT_ROLE[ROLE_LABELS[r]] ?? ROLE_LABELS[r])
    .join(' · ');
  const drawerOpen = desktop || menuOpen;
  const fullName = `${user?.first_name ?? ''} ${user?.last_name ?? ''}`.trim();

  useEffect(() => {
    const media = window.matchMedia('(min-width: 961px)');
    const sync = () => {
      setDesktop(media.matches);
      if (media.matches) setMenuOpen(false);
    };
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (!menuOpen || desktop) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen, desktop]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <AlertsProvider>
      <div className="shell">
        <a href="#contenido-principal" className="skip-link">
          Saltar al contenido
        </a>

        <header className="shell-topbar">
          <button
            type="button"
            className="shell-menu-btn"
            aria-expanded={menuOpen}
            aria-controls="shell-sidebar"
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <Link to={home} className="shell-topbar-title" onClick={closeMenu}>
            SIGMOV-ULEAM
          </Link>
          <div className="shell-topbar-right">
            <NotificationBell placement="down" />
            <span className="shell-topbar-role">ROL: {roles}</span>
            <span className="shell-topbar-user">
              <UserRound size={16} aria-hidden />
              {fullName || 'Usuario'}
            </span>
          </div>
        </header>

        <aside
          id="shell-sidebar"
          className={`shell-sidebar${menuOpen ? ' is-open' : ''}`}
          aria-label="Navegación principal"
          aria-hidden={!drawerOpen}
          {...(!drawerOpen ? { inert: true } : {})}
        >
          <div className="shell-brand">
            <Link to={home} className="shell-brand-link" onClick={closeMenu}>
              <span className="shell-logo" aria-hidden>
                <img
                  src="/logo-uleam-cara.png"
                  alt=""
                  className="shell-logo-img"
                />
              </span>
              <span>
                <strong className="shell-brand-title">Bienvenido</strong>
                <span className="shell-brand-sub">
                  {user?.national_id || roles}
                </span>
              </span>
            </Link>
            {(isDualConductorMechanic(roleIds) ||
              isDualDocenteFacultad(roleIds)) && (
              <p className="shell-dual-note">Doble rol activo</p>
            )}
          </div>

          <nav className="shell-nav" aria-label="Módulos">
            <NavLink
              to={home}
              end
              className={({ isActive }) =>
                `shell-nav-link shell-nav-home${isActive ? ' is-active' : ''}`
              }
              onClick={closeMenu}
            >
              INICIO
            </NavLink>

            {Object.entries(grouped).map(([module, links]) => {
              const groupOpen = links.some((link) =>
                location.pathname.startsWith(link.path)
              );
              return (
                <details
                  key={module}
                  className="shell-nav-group"
                  open={groupOpen || undefined}
                >
                  <summary>
                    <span>{module}</span>
                    <ChevronDown size={16} aria-hidden />
                  </summary>
                  <ul>
                    {links.map((link) => (
                      <li key={link.id}>
                        <NavLink
                          to={link.path}
                          className={({ isActive }) =>
                            `shell-nav-link${isActive ? ' is-active' : ''}`
                          }
                          onClick={closeMenu}
                        >
                          {navLabel(link, true)}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </details>
              );
            })}
          </nav>

          <footer className="shell-user">
            <button
              type="button"
              className="shell-logout"
              onClick={() => void handleLogout()}
            >
              <LogOut size={16} aria-hidden />
              Cerrar sesión
            </button>
          </footer>
        </aside>

        {menuOpen && (
          <button
            type="button"
            className="shell-backdrop"
            aria-label="Cerrar menú"
            onClick={closeMenu}
          />
        )}

        <main id="contenido-principal" className="shell-main" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
    </AlertsProvider>
  );
}
