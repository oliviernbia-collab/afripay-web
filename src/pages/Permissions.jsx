import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import Banner from '../components/Banner';

const ROLES = [
  { value: 'super_admin', label: 'Super administrateur', editable: false },
  { value: 'conformite', label: 'Conformité', editable: true },
  { value: 'support', label: 'Support', editable: true },
];

// Construit { conformite: Set<code>, support: Set<code> } à partir de la liste brute renvoyée par
// GET /admin/permissions (super_admin n'y figure jamais — il contourne toujours la vérification,
// voir backend/src/services/permissionService.js).
function toGrantedByRole(rolePermissions) {
  const next = { conformite: new Set(), support: new Set() };
  for (const row of rolePermissions) {
    if (next[row.role]) next[row.role].add(row.permission_code);
  }
  return next;
}

export default function Permissions() {
  const [permissions, setPermissions] = useState([]);
  const [granted, setGranted] = useState({ conformite: new Set(), support: new Set() });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dirty, setDirty] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    return api
      .get('/admin/permissions')
      .then((data) => {
        setPermissions(data.permissions);
        setGranted(toGrantedByRole(data.rolePermissions));
        setDirty(false);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const grouped = useMemo(() => {
    const byCategory = new Map();
    for (const p of permissions) {
      if (!byCategory.has(p.categorie)) byCategory.set(p.categorie, []);
      byCategory.get(p.categorie).push(p);
    }
    return Array.from(byCategory.entries());
  }, [permissions]);

  function toggle(role, code) {
    setGranted((prev) => {
      const next = { ...prev, [role]: new Set(prev[role]) };
      if (next[role].has(code)) next[role].delete(code);
      else next[role].add(code);
      return next;
    });
    setDirty(true);
    setSuccess('');
  }

  async function handleSave() {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await api.put('/admin/permissions', {
        conformite: Array.from(granted.conformite),
        support: Array.from(granted.support),
      });
      setSuccess('Permissions enregistrées avec succès.');
      setDirty(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Permissions</h1>
          <p>Droits accordés à chaque rôle interne. Le super administrateur a toujours accès à tout.</p>
        </div>
      </div>

      <Banner type="error" message={error} onClose={() => setError('')} />
      <Banner type="success" message={success} onClose={() => setSuccess('')} />

      {loading && (
        <div className="loading-block">
          <div className="spinner" />
        </div>
      )}

      {!loading && (
        <>
          <div className="table-wrap" style={{ marginTop: 20 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Permission</th>
                  {ROLES.map((r) => (
                    <th key={r.value} style={{ textAlign: 'center' }}>{r.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {grouped.map(([categorie, items]) => (
                  <Fragment key={categorie}>
                    <tr>
                      <td colSpan={ROLES.length + 1} className="text-secondary" style={{ fontWeight: 600, paddingTop: 16 }}>
                        {categorie}
                      </td>
                    </tr>
                    {items.map((p) => (
                      <tr key={p.code}>
                        <td data-label="Permission">
                          <div>{p.libelle}</div>
                          {p.description && <div className="text-muted" style={{ fontSize: '0.78rem' }}>{p.description}</div>}
                        </td>
                        {ROLES.map((r) => (
                          <td key={r.value} data-label={r.label} style={{ textAlign: 'center' }}>
                            <input
                              type="checkbox"
                              checked={r.value === 'super_admin' ? true : granted[r.value]?.has(p.code) || false}
                              disabled={!r.editable || saving}
                              onChange={() => toggle(r.value, p.code)}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>

          <div className="row" style={{ marginTop: 16 }}>
            <button type="button" className="btn btn-cta" disabled={!dirty || saving} onClick={handleSave}>
              {saving ? 'Enregistrement…' : 'Enregistrer les modifications'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
