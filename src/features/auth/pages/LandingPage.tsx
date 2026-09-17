import { useEffect, useId, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  ArrowRight,
  Bell,
  ClipboardCheck,
  FilePenLine,
  MapPinned,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const STEPS = [
  {
    id: 'solicitar',
    title: 'Solicitar',
    who: 'Docente o facultad',
    text: 'Registra origen, destino, fecha, motivo y ocupantes. El sistema arma el expediente institucional.',
  },
  {
    id: 'autorizar',
    title: 'Autorizar',
    who: 'Secretaría o Vicerrectorado',
    text: 'Interna: Secretaría. Externa: Vicerrectorado. Cada aviso muestra el detalle del viaje y qué hay que hacer.',
  },
  {
    id: 'asignar',
    title: 'Asignar',
    who: 'Secretaría',
    text: 'Se asigna vehículo y conductor. El conductor acepta o rechaza; si rechaza, se reasigna.',
  },
  {
    id: 'inspeccionar',
    title: 'Inspeccionar',
    who: 'Taller',
    text: 'El mecánico levanta el acta de entrega antes de la salida y deja constancia del estado de la unidad.',
  },
  {
    id: 'firmar',
    title: 'Firmar y archivar',
    who: 'Quien corresponda',
    text: 'Se abre el PDF, se revisa en pantalla y se firma encima. También se puede adjuntar el papel sellado por ULEAM.',
  },
] as const;

const ROLES = [
  {
    id: 'secretaria',
    title: 'Secretaría',
    summary: 'Autoriza, asigna flota y supervisa la operación.',
    detail:
      'Revisa solicitudes, asigna conductor y vehículo, reasigna rechazos, genera reportes y documentos institucionales.',
  },
  {
    id: 'docente',
    title: 'Docente / Facultad',
    summary: 'Solicita el viaje y sigue su estado.',
    detail:
      'Crea la solicitud, invita participantes, firma la orden y consulta el seguimiento hasta el retorno.',
  },
  {
    id: 'vicerrector',
    title: 'Vicerrectorado',
    summary: 'Aprueba movilizaciones externas.',
    detail:
      'Recibe las salidas fuera del cantón o de mayor alcance y deja el visto bueno o el rechazo con trazabilidad.',
  },
  {
    id: 'conductor',
    title: 'Conductor',
    summary: 'Acepta el viaje y recorre la ruta.',
    detail:
      'Ve el detalle (origen, destino, horario y unidad), acepta o rechaza, usa el mapa y reporta novedades.',
  },
  {
    id: 'mecanico',
    title: 'Mecánico',
    summary: 'Entrega la unidad en condiciones.',
    detail:
      'Levanta actas, registra lubricantes y novedades, y no deja salir una unidad con mantenimiento vencido.',
  },
  {
    id: 'estudiante',
    title: 'Estudiante',
    summary: 'Confirma su cupo en el viaje.',
    detail:
      'Recibe la invitación con el detalle del recorrido y confirma o declina su participación.',
  },
] as const;

const CAPABILITIES = [
  {
    icon: Truck,
    title: 'Flota institucional',
    text: 'Disponibilidad, kilometraje, aceite y documentos de cada unidad, visibles para quien opera.',
  },
  {
    icon: Bell,
    title: 'Avisos con detalle',
    text: 'Cada notificación de viaje muestra origen, destino, fecha y la acción pendiente. Si se resolvió, desaparece.',
  },
  {
    icon: FilePenLine,
    title: 'Firma sobre el PDF',
    text: 'Se visualiza el formato ULEAM y se firma encima, con contraseña y constancia digital.',
  },
  {
    icon: ClipboardCheck,
    title: 'Trazabilidad',
    text: 'Queda registro de quién autorizó, quién condujo y qué documento se archivó.',
  },
  {
    icon: MapPinned,
    title: 'Ruta y seguimiento',
    text: 'El conductor y Secretaría pueden ver el recorrido institucional en el mapa.',
  },
  {
    icon: ShieldCheck,
    title: 'Acceso institucional',
    text: 'Correos @uleam.edu.ec y @live.uleam.edu.ec. En producción, cuenta ULEAM (Entra ID).',
  },
];

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const [step, setStep] = useState(0);
  const [role, setRole] = useState<(typeof ROLES)[number]['id']>('secretaria');
  const [paused, setPaused] = useState(false);
  const stepsLabel = useId();
  const rolesLabel = useId();
  const activeRole = ROLES.find((item) => item.id === role) ?? ROLES[0];

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || paused) return;
    const timer = window.setInterval(() => {
      setStep((current) => (current + 1) % STEPS.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [paused]);

  if (isAuthenticated) {
    return <Navigate to="/app" replace />;
  }

  return (
    <div className="landing">
      <a className="skip-link" href="#inicio-contenido">
        Saltar al contenido
      </a>

      <div className="landing-flag" aria-hidden>
        <span className="is-green" />
        <span className="is-white" />
        <span className="is-red" />
      </div>

      <header className="landing-nav">
        <Link to="/" className="landing-brand">
          <img
            src="/brand/logo-uleam.png"
            alt="Escudo de la Universidad Laica Eloy Alfaro de Manabí"
            width={48}
            height={48}
          />
          <span>
            <strong>ULEAM Movilidad</strong>
            <small>Universidad Laica Eloy Alfaro de Manabí</small>
          </span>
        </Link>
        <nav aria-label="Secciones de la página">
          <a href="#sistema">El sistema</a>
          <a href="#flujo">Flujo</a>
          <a href="#roles">Roles</a>
          <Link to="/login" className="btn btn-primary">
            Iniciar sesión
          </Link>
        </nav>
      </header>

      <main id="inicio-contenido">
        <section className="landing-hero" aria-labelledby="hero-title">
          <img
            className="landing-hero-photo"
            src="/brand/hero-campus.png"
            alt="Campus universitario costero al atardecer, con edificios académicos y unidades de transporte institucional."
          />
          <div className="landing-hero-shade" />
          <div className="landing-hero-copy">
            <p className="landing-kicker">Campus matriz · Manta, Manabí</p>
            <h1 id="hero-title">Movilización institucional con orden, firma y seguimiento</h1>
            <p>
              Plataforma de la ULEAM para solicitar, autorizar, asignar y documentar
              viajes oficiales: de la solicitud al PDF firmado, con avisos claros
              para cada persona responsable.
            </p>
            <div className="landing-hero-actions">
              <Link to="/login" className="btn btn-gold">
                Entrar al sistema
                <ArrowRight size={18} aria-hidden />
              </Link>
              <a href="#flujo" className="btn btn-outline landing-hero-ghost">
                Ver cómo funciona
              </a>
            </div>
          </div>
        </section>

        <section id="sistema" className="landing-section" aria-labelledby="sistema-title">
          <div className="landing-split">
            <div>
              <p className="landing-kicker">Sobre el sistema</p>
              <h2 id="sistema-title">Hecho para la operación real de la universidad</h2>
              <p className="landing-lead">
                ULEAM Movilidad cubre el ciclo completo de un viaje institucional:
                solicitud académica, autorización, unidad, acta de taller, documentos
                PST y notificaciones que se retiran solas cuando el trámite ya se
                resolvió.
              </p>
              <ul className="landing-facts">
                <li>Matriz en Circunvalación – Vía San Mateo, Manta.</li>
                <li>Formatos institucionales y respaldo PDF para archivo físico.</li>
                <li>Acceso con correo institucional ULEAM.</li>
              </ul>
            </div>
            <figure className="landing-photo-card">
              <img
                src="/brand/facultad-medicina.jpg"
                alt="Fachada de la Facultad de Medicina de la ULEAM en Manta. Foto: Héctor Pinargote C., Wikimedia Commons."
              />
              <figcaption>
                Facultad de Medicina, campus ULEAM. Foto de Héctor Pinargote C.
                (Wikimedia Commons, CC BY-SA).
              </figcaption>
            </figure>
          </div>

          <ul className="landing-cards">
            {CAPABILITIES.map((item) => (
              <li key={item.title}>
                <item.icon size={22} aria-hidden />
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section
          id="flujo"
          className="landing-section landing-section-alt"
          aria-labelledby={stepsLabel}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <p className="landing-kicker">Recorrido</p>
          <h2 id={stepsLabel}>Del pedido al documento archivado</h2>
          <p className="landing-lead">
            Pulse un paso para ver qué ocurre. El recorrido avanza solo; se pausa
            cuando usted lo explora.
          </p>
          <div className="landing-steps" role="tablist" aria-label="Pasos del flujo">
            {STEPS.map((item, index) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={step === index}
                className={step === index ? 'is-active' : undefined}
                onClick={() => {
                  setPaused(true);
                  setStep(index);
                }}
              >
                <span>{index + 1}</span>
                {item.title}
              </button>
            ))}
          </div>
          <article className="landing-step-panel" aria-live="polite">
            <p className="landing-kicker">{STEPS[step].who}</p>
            <h3>{STEPS[step].title}</h3>
            <p>{STEPS[step].text}</p>
          </article>
        </section>

        <section id="roles" className="landing-section" aria-labelledby={rolesLabel}>
          <p className="landing-kicker">Comunidad universitaria</p>
          <h2 id={rolesLabel}>Cada rol ve lo que le corresponde</h2>
          <p className="landing-lead">
            Elija un perfil. El panel y las notificaciones se ajustan a esa
            responsabilidad.
          </p>
          <div className="landing-roles" role="tablist" aria-label="Roles del sistema">
            {ROLES.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={role === item.id}
                className={role === item.id ? 'is-active' : undefined}
                onClick={() => setRole(item.id)}
              >
                <strong>{item.title}</strong>
                <span>{item.summary}</span>
              </button>
            ))}
          </div>
          <article className="landing-role-panel" aria-live="polite">
            <h3>{activeRole.title}</h3>
            <p>{activeRole.detail}</p>
            <Link to="/login" className="btn btn-primary">
              Iniciar sesión como {activeRole.title}
              <ArrowRight size={16} aria-hidden />
            </Link>
          </article>
        </section>

        <section className="landing-cta" aria-labelledby="cta-title">
          <h2 id="cta-title">Ingrese con su cuenta institucional</h2>
          <p>
            Use su correo ULEAM. Si ya tiene sesión, el sistema lo lleva directo a
            su panel.
          </p>
          <Link to="/login" className="btn btn-gold">
            Ir a iniciar sesión
            <ArrowRight size={18} aria-hidden />
          </Link>
        </section>
      </main>

      <footer className="landing-foot">
        <div>
          <img src="/brand/logo-uleam-horizontal.png" alt="" width={72} height={62} />
          <p>
            Universidad Laica Eloy Alfaro de Manabí · Dirección Administrativa /
            Transporte institucional
          </p>
        </div>
        <address>
          Circunvalación – Vía San Mateo, Manta, Manabí, Ecuador
          <br />
          <a href="mailto:contacto@uleam.edu.ec">contacto@uleam.edu.ec</a>
          {' · '}
          <a href="https://www.uleam.edu.ec/" rel="noreferrer" target="_blank">
            uleam.edu.ec
          </a>
        </address>
      </footer>
    </div>
  );
}
