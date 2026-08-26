import { useEffect, useMemo, useState } from 'react';
import { ApiError, type RecordSummary } from '../api/types';
import { listRecords } from '../api/client';
import { ErrorBanner } from '../components/Feedback';

export function Analytics() {
  const [records, setRecords] = useState<RecordSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);

        const res = await listRecords(0, 100);

        setRecords(res.records);
        setTotal(res.total);
      } catch (e) {
        if (e instanceof ApiError && e.status === 503) {
          setError(
            'Analytics is unavailable because the records service is not configured.'
          );
        } else {
          setError(
            e instanceof Error
              ? e.message
              : 'Failed to load analytics.'
          );
        }
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  const analytics = useMemo(() => {
    const verified = records.filter(
      (r) => r.outcome === 'verified'
    ).length;

    const repaired = records.filter(
      (r) => r.outcome === 'verified_repaired'
    ).length;

    const rejected = records.filter(
      (r) => r.outcome === 'rejected'
    ).length;

    const successRate =
      records.length > 0
        ? Math.round(
            ((verified + repaired) / records.length) * 100
          )
        : 0;

    const repairRate =
      records.length > 0
        ? Math.round(
            (repaired / records.length) * 100
          )
        : 0;

    return {
      verified,
      repaired,
      rejected,
      successRate,
      repairRate,
    };
  }, [records]);

  if (loading) {
    return (
      <div className="page">
        <div className="container">
          <h1 className="page-title">Analytics</h1>
          <p>Loading verification analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <h1 className="page-title">
          Verification Analytics
        </h1>

        <p>
          Monitor your AI verification performance.
        </p>

        {error && (
          <ErrorBanner
            title="Could not load analytics"
            message={error}
          />
        )}

        {!error && (
          <>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fit, minmax(180px, 1fr))',
                gap: 16,
              }}
            >
              <StatCard
                title="Total Verifications"
                value={total}
              />

              <StatCard
                title="Verified"
                value={analytics.verified}
              />

              <StatCard
                title="Repaired"
                value={analytics.repaired}
              />

              <StatCard
                title="Rejected"
                value={analytics.rejected}
              />
            </div>

            <div
              className="card card-pad"
              style={{ marginTop: 20 }}
            >
              <h2>Success Rate</h2>

              <div
                style={{
                  fontSize: 40,
                  fontWeight: 700,
                }}
              >
                {analytics.successRate}%
              </div>

              <p>
                Outputs successfully verified or repaired.
              </p>
            </div>

            <div
              className="card card-pad"
              style={{ marginTop: 16 }}
            >
              <h2>Premium Analytics</h2>

              <p>
                Unlock longer history, trends, reports,
                and team-level verification insights.
              </p>

              <button
                type="button"
                className="btn btn-accent"
                onClick={() =>
                  alert('Premium analytics coming soon.')
                }
              >
                Upgrade to Premium
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div className="card card-pad">
      <p>{title}</p>

      <div
        style={{
          fontSize: 32,
          fontWeight: 700,
        }}
      >
        {value}
      </div>
    </div>
  );
}
