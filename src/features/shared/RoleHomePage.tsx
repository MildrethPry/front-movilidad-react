import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ROLE_EXPERIENCE } from '../../config/roleExperience';
import {
  ROLE_LABELS,
  isDualConductorMechanic,
  isDualDocenteFacultad,
  type RoleId,
} from '../../config/roles';
import OperationalDashboard from './OperationalDashboard';

type Props = {
  focusRoles: RoleId[];
  title: string;
  subtitle: string;
};

export default function RoleHomePage({ focusRoles, title, subtitle }: Props) {
  const { user, roleIds } = useAuth();
  const active = focusRoles.filter((r) => roleIds.includes(r));
  const focusRole = (active[0] || roleIds[0]) as RoleId | undefined;
  const experience = focusRole ? ROLE_EXPERIENCE[focusRole] : undefined;

  return (
    <section className="role-home sgv-panel" aria-labelledby="role-home-title">
      <header className="sgv-panel-head">
        <h1 id="role-home-title">{title}</h1>
      </header>
      <div className="sgv-panel-body role-home-body">
        <header className="role-home-hero">
          <p className="module-kicker">
            {active.map((r) => ROLE_LABELS[r]).join(' · ') || 'Panel'}
          </p>
          <p className="module-lead">
            Hola, {user?.first_name}. {experience?.promise ?? subtitle}
          </p>
          {(isDualConductorMechanic(roleIds) ||
            isDualDocenteFacultad(roleIds)) && (
            <p className="role-home-dual" role="note">
              Doble rol: el menú lateral separa las funciones de cada perfil.
            </p>
          )}
        </header>

        {experience && (
          <nav className="role-pillars" aria-label="Procesos de este panel">
            {experience.pillars.map((pillar) => (
              <Link key={pillar.href} to={pillar.href} className="role-pillar">
                <strong>
                  {pillar.title}
                  <ArrowUpRight size={14} aria-hidden />
                </strong>
                <span>{pillar.text}</span>
              </Link>
            ))}
          </nav>
        )}

        <OperationalDashboard focusRole={focusRole} />

        {experience && (
          <details className="role-guide">
            <summary>Cómo usar este panel</summary>
            <ol>
              {experience.guide.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </details>
        )}
      </div>
    </section>
  );
}
