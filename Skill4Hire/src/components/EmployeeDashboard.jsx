
import { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './EmployeeDashboard.css';

const sampleCompany = {
  id: 'example-company',
  name: 'WinStar Consultations Pvt Ltd',
  openings: 3,
  _example: true
};

const sampleCandidate = {
  id: 'example-candidate',
  name: 'John Doe',
  role: 'Frontend Developer',
  skills: ['React', 'CSS', 'JavaScript'],
  exp: '3 years',
  _example: true
};

const EmployeeDashboard = () => {
  const [companyQuery, setCompanyQuery] = useState('');
  const [candidateQuery, setCandidateQuery] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  // new: state for backend data + loading / error
  const [companies, setCompanies] = useState([sampleCompany]);
  const [candidates, setCandidates] = useState([sampleCandidate]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // fetch companies & candidates from backend on mount
  useEffect(() => {
    const ac = new AbortController();

    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        // change endpoints if your backend uses different paths or base URL
        const [cRes, uRes] = await Promise.all([
          fetch('/api/companies', { signal: ac.signal }).catch(() => null),
          fetch('/api/candidates', { signal: ac.signal }).catch(() => null),
        ]);

        const parseJsonSafe = async (res, fallback = []) => {
          try {
            if (!res || !res.ok) return fallback;
            const ct = res.headers.get('content-type') || '';
            if (ct.includes('application/json')) {
              return await res.json();
            }
            // Attempt to parse text; fallback if it isn't JSON
            const text = await res.text();
            return text ? JSON.parse(text) : fallback;
          } catch {
            return fallback;
          }
        };

        const companiesData = await parseJsonSafe(cRes, []);
        const candidatesData = await parseJsonSafe(uRes, []);

        // merge backend data but keep example for reference (avoid duplicates)
        const companiesMap = new Map();
        // add sample first
        companiesMap.set(sampleCompany.id, sampleCompany);
        (Array.isArray(companiesData) ? companiesData : []).forEach(c => {
          companiesMap.set(c.id ?? c._id ?? `${c.name}`, c);
        });
        const mergedCompanies = Array.from(companiesMap.values());

        const candidatesMap = new Map();
        candidatesMap.set(sampleCandidate.id, sampleCandidate);
        (Array.isArray(candidatesData) ? candidatesData : []).forEach(c => {
          candidatesMap.set(c.id ?? c._id ?? `${c.name}`, c);
        });
        const mergedCandidates = Array.from(candidatesMap.values());

        // Expect arrays in this shape:
        // companiesData = [{ id, name, openings }, ...]
        // candidatesData = [{ id, name, role, skills:[], exp }, ...]

        setCompanies(mergedCompanies);
        setCandidates(mergedCandidates);
      } catch (err) {
        if (err.name !== 'AbortError') setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }

    loadData();
    return () => ac.abort();
  }, []);

  const filteredCompanies = useMemo(() => {
    const q = companyQuery.toLowerCase();
    return companies.filter(c => (c.name || '').toLowerCase().includes(q));
  }, [companyQuery, companies]);

  const filteredCandidates = useMemo(() => {
    const q = candidateQuery.toLowerCase();
    return candidates.filter(c =>
      (c.name || '').toLowerCase().includes(q) ||
      (c.role || '').toLowerCase().includes(q) ||
      ((Array.isArray(c.skills) ? c.skills.join(' ').toLowerCase() : '')).includes(q)
    );
  }, [candidateQuery, candidates]);

  return (
    <div className="employee-dashboard">
      <header className="ed-header">
        <h1>Hi, {companies[0]?.name ?? 'Employer'}</h1>
        <div className="ed-actions">
          <Link to="/" className="ed-link">Home</Link>
          <Link to="/login" className="ed-link">Sign out</Link>
        </div>
      </header>

      {loading ? (
        <div className="ed-loading container">Loading...</div>
      ) : (
        <>
          {error && (
            <div className="ed-error container">Error: {error}</div>
          )}
          <section className="ed-search-panels">
            <div className="ed-card">
              <h2>Companies requesting candidates</h2>
              <input
                type="text"
                placeholder="Search companies..."
                value={companyQuery}
                onChange={(e) => setCompanyQuery(e.target.value)}
              />
              <ul className="ed-list">
                {filteredCompanies.map(c => (
                  <li key={c.id ?? c.name} className="ed-list-item">
                    <div>
                      <strong>
                        {c.name}
                        {c._example ? ' (example)' : ''}
                      </strong>
                      <span className="muted"> • {c.openings ?? '—'} openings</span>
                    </div>
                    {selectedCandidate && (
                      <button
                        className="primary"
                        onClick={() => alert(`Suggested ${selectedCandidate.name} to ${c.name}`)}
                      >
                        Suggest candidate
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div className="ed-card">
              <h2>Candidate CVs</h2>
              <input
                type="text"
                placeholder="Search candidates, roles, or skills..."
                value={candidateQuery}
                onChange={(e) => setCandidateQuery(e.target.value)}
              />
              <ul className="ed-list">
                {filteredCandidates.map(c => (
                  <li key={c.id ?? c.name} className="ed-list-item">
                    <div className="candidate-summary">
                      <div>
                        <strong>
                          {c.name}
                          {c._example ? ' (example)' : ''}
                        </strong>
                        <span className="muted"> • {c.role} • {c.exp} exp</span>
                      </div>
                      <div className="tags">
                        {(c.skills || []).map(s => (<span key={s} className="tag">{s}</span>))}
                      </div>
                    </div>
                    <div className="candidate-actions">
                      <button className="outline" onClick={() => alert(`Viewing CV of ${c.name}`)}>View CV</button>
                      <button className="primary" onClick={() => setSelectedCandidate(c)}>Select to suggest</button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {selectedCandidate && (
            <div className="ed-selected">
              <span>Selected candidate to suggest: </span>
              <strong>{selectedCandidate.name}</strong>
              <button className="link" onClick={() => setSelectedCandidate(null)}>Clear</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EmployeeDashboard;
