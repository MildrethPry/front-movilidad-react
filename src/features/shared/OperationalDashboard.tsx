import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  AlertTriangle,
  Download,
  FileText,
  RefreshCw,
} from 'lucide-react';
import api from '@/services/api';
import { REQUEST_STATUS_LABEL, labelOf } from '@/lib/labels';
import type { RoleId } from '@/config/roles';

type Kpi = {
  key: string;
  label: string;
  value: number | string;
  tone?: 'ok' | 'warn' | 'danger' | 'info';
  href?: string;
  hint?: string;
};

type QueueItem = {
  id: string;
  title: string;
  count: number;
  href: string;
  description: string;
};

type Chart = {
  id: string;
  title: string;
  items: Array<{ label: string; value: number }>;
};

type DashData = {
  title: string;
  subtitle: string;
  period: string;
  kpis: Kpi[];
  queue: QueueItem[];
  charts: Chart[];
  recent: Array<{ id: number; label: string; meta: string; href: string }>;
  exports: Array<{ label: string; kind: string; href: string }>;
};

function chartLabel(raw: string): string {
  return labelOf(REQUEST_STATUS_LABEL, raw);
}

async function downloadReportPdf(kind: string) {
  const token = localStorage.getItem('access_token');
  const base = (api.defaults.baseURL || 'http://localhost:8000/api').replace(
    /\/$/,
    ''
  );
  const res = await fetch(`${base}/reportes/${kind}?format=pdf`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('No se pudo descargar el PDF.');
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${kind}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function OperationalDashboard({
  focusRole,
}: {
  focusRole?: RoleId;
}) {
  const [data, setData] = useState<DashData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: res } = await api.get('/dashboard/metrics', {
        params: focusRole ? { focus: focusRole } : undefined,
      });
      setData(res);
    } catch {
      setError('No se pudo cargar el tablero operativo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [focusRole]);

  if (loading && !data) {
    return <p className="ops-muted" role="status">Cargando tablero…</p>;
  }

  if (error || !data) {
    return (
      <div className="alert alert-danger" role="alert">
        {error || 'Sin datos del tablero.'}
      </div>
    );
  }

  return (
    <div className="ops-dashboard">
      <div className="ops-dashboard-head">
        <div>
          <p className="module-kicker">Tablero interactivo · {data.period}</p>
          <h2>{data.title}</h2>
          <p className="module-lead">{data.subtitle}</p>
        </div>
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => void load()}
          aria-label="Actualizar tablero"
        >
          <RefreshCw size={16} /> Actualizar
        </button>
      </div>

      {pdfError && (
        <div className="alert alert-danger" role="alert">
          {pdfError}
        </div>
      )}

      <div className="ops-kpi-grid">
        {data.kpis.map((kpi) => (
          <Link
            key={kpi.key}
            to={kpi.href || '#'}
            className={`ops-kpi tone-${kpi.tone || 'info'}`}
          >
            <span>{kpi.label}</span>
            <strong>{kpi.value}</strong>
            {kpi.hint && <em>{kpi.hint}</em>}
          </Link>
        ))}
      </div>

      {data.queue.length > 0 && (
        <section className="module-panel ops-queue">
          <h3>Cola de trabajo</h3>
          <ul>
            {data.queue.map((item) => (
              <li key={item.id}>
                <Link to={item.href}>
                  <span className="ops-queue-count">{item.count}</span>
                  <span>
                    <strong>{item.title}</strong>
                    <em>{item.description}</em>
                  </span>
                  <ArrowUpRight size={16} aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {data.charts.length > 0 && (
        <div className="ops-chart-grid">
          {data.charts.map((chart) => {
            const localMax = Math.max(1, ...chart.items.map((i) => i.value));
            return (
            <section key={chart.id} className="module-panel">
              <h3>{chart.title}</h3>
              <div className="ops-bars">
                {chart.items.length === 0 && (
                  <p className="ops-muted">Sin datos aún.</p>
                )}
                {chart.items.map((item) => (
                  <div key={item.label} className="ops-bar-row">
                    <span title={item.label}>{chartLabel(item.label)}</span>
                    <div className="ops-bar-track">
                      <div
                        className="ops-bar-fill"
                        style={{
                          width: `${Math.max(6, (item.value / localMax) * 100)}%`,
                        }}
                      />
                    </div>
                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
            </section>
            );
          })}
        </div>
      )}

      <div className="ops-side-grid">
        {data.recent.length > 0 && (
          <section className="module-panel">
            <h3>Actividad reciente</h3>
            <ul className="ops-recent">
              {data.recent.map((row) => (
                <li key={row.id}>
                  <Link to={row.href}>
                    <strong>{row.label}</strong>
                    <span>{chartLabel(row.meta)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {data.exports.length > 0 && (
          <section className="module-panel">
            <h3>Respaldos PDF</h3>
            <p className="ops-muted">
              Genere el formato institucional para archivo físico.
            </p>
            <div className="ops-export-list">
              {data.exports.map((item) =>
                item.kind === 'documentos' ? (
                  <Link key={item.label} className="btn btn-outline" to={item.href}>
                    <FileText size={16} /> {item.label}
                  </Link>
                ) : (
                  <button
                    key={item.label}
                    type="button"
                    className="btn btn-uleam-sso"
                    onClick={() => {
                      setPdfError(null);
                      void downloadReportPdf(item.kind).catch(() =>
                        setPdfError(`No se pudo generar el PDF de ${item.label}.`)
                      );
                    }}
                  >
                    <Download size={16} /> {item.label}
                  </button>
                )
              )}
            </div>
          </section>
        )}
      </div>

      {data.kpis.some((k) => k.tone === 'danger') && (
        <p className="ops-dashboard-alert">
          <AlertTriangle size={16} /> Hay alertas de flota o taller. Use la cola
          de trabajo para atenderlas.
        </p>
      )}
    </div>
  );
}
