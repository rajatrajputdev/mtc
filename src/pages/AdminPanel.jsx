import React, { useState, useEffect } from 'react';
import gsap from 'gsap';

// Minimalist Icons
const ExportIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
  </svg>
);

const LogoutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
    <polyline points="16 17 21 12 16 7"></polyline>
    <line x1="21" y1="12" x2="9" y2="12"></line>
  </svg>
);

const LinkIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
  </svg>
);

const AdminPanel = () => {
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(sessionStorage.getItem('adminToken') || '');
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Add noindex meta tag
  useEffect(() => {
    let meta = document.querySelector('meta[name="robots"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'robots';
      meta.content = 'noindex, nofollow';
      document.head.appendChild(meta);
    } else {
      meta.content = 'noindex, nofollow';
    }
    return () => {
      if (meta) document.head.removeChild(meta);
    };
  }, []);

  useEffect(() => {
    if (token) {
      fetchRegistrations();
    }
  }, [token]);

  // Auto-logout after 5 minutes of inactivity
  useEffect(() => {
    if (!token) return;
    
    let timeoutId;
    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        handleLogout();
        setError('Session expired due to inactivity.');
      }, 5 * 60 * 1000); // 5 minutes
    };

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('click', resetTimer);
    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('click', resetTimer);
    };
  }, [token]);

  // Entrance Animation
  useEffect(() => {
    if (token) {
      gsap.fromTo(".admin-fade-in", 
        { opacity: 0, y: 20 }, 
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", stagger: 0.05 }
      );
    }
  }, [token, registrations]);

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/registrations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          handleLogout();
          throw new Error('Session expired or invalid token');
        }
        throw new Error('Failed to fetch data');
      }
      const data = await response.json();
      setRegistrations(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await response.json();
      if (response.ok) {
        setToken(data.token);
        sessionStorage.setItem('adminToken', data.token);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setToken('');
    setRegistrations([]);
    sessionStorage.removeItem('adminToken');
  };

  const exportToCSV = () => {
    if (registrations.length === 0) return;
    const headers = [
      'Name', 'Email', 'Contact Number', 'College Type', 'Enrollment No / College Name',
      'Course', 'Specialisation', 'Year', 'LinkedIn', 'GitHub', 'Motivation', 'Registration Date'
    ];
    const rows = registrations.map(reg => [
      `"${reg.name || ''}"`,
      `"${reg.email || ''}"`,
      `"${reg.contactNumber || ''}"`,
      `"${reg.collegeType || ''}"`,
      `"${reg.enrollmentNo || reg.collegeName || ''}"`,
      `"${reg.courseName || ''}"`,
      `"${reg.specialisation || ''}"`,
      `"${reg.year || ''}"`,
      `"${reg.linkedinUrl || ''}"`,
      `"${reg.githubUrl || ''}"`,
      `"${(reg.motivation || '').replace(/"/g, '""')}"`,
      `"${new Date(reg.registrationDate).toLocaleString()}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `bootcamp_registrations_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-['DM_Sans',sans-serif] text-slate-900">
        <div className="max-w-sm w-full bg-white p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center font-bold text-xl mx-auto mb-4">
              A
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Admin Login</h1>
            <p className="text-slate-500 mt-2 text-sm font-medium">Enter credentials to proceed</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-lg mb-6 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-slate-600 text-xs font-bold uppercase tracking-wider mb-2">Master Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                placeholder="••••••••"
                autoComplete="new-password"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white font-semibold py-3 px-4 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-['DM_Sans',sans-serif] text-slate-900 pb-24">
      {/* Sticky Minimal Navbar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center font-bold text-sm">
                A
              </div>
              <span className="font-bold text-lg tracking-tight">Admin Dashboard</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 mr-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <span className="text-sm text-slate-500 font-medium">{registrations.length} Verified Signups</span>
              </div>
              <button 
                onClick={exportToCSV} 
                className="flex items-center gap-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg transition-colors"
              >
                <ExportIcon /> <span className="hidden sm:inline">Export</span>
              </button>
              <div className="w-px h-6 bg-slate-200 mx-1"></div>
              <button 
                onClick={handleLogout} 
                className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-red-600 transition-colors"
                title="Logout"
              >
                <LogoutIcon />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-lg mb-8">
            {error}
          </div>
        )}

        <div className="mb-6 flex justify-between items-end">
          <h2 className="text-xl font-bold text-slate-800">Recent Registrations</h2>
          {/* Mobile counter */}
          <span className="md:hidden text-sm text-slate-500 font-medium bg-white border border-slate-200 px-3 py-1 rounded-full shadow-sm">
            Total: {registrations.length}
          </span>
        </div>

        {/* List of Data Cards instead of dense table */}
        <div className="space-y-4">
          {loading && registrations.length === 0 ? (
            <div className="text-center py-20 text-slate-400 font-medium">Fetching secure data...</div>
          ) : registrations.length === 0 ? (
            <div className="text-center py-20 bg-white border border-slate-200 rounded-xl shadow-sm text-slate-500">
              No registrations found.
            </div>
          ) : (
            registrations.map((reg) => (
              <div key={reg._id} className="admin-fade-in bg-white rounded-xl shadow-sm border border-slate-200 p-5 md:p-6 flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow">
                
                {/* Left: Identity */}
                <div className="flex items-start gap-4 md:w-1/3">
                  <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg flex-shrink-0">
                    {reg.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 text-base truncate">{reg.name}</h3>
                    <p className="text-slate-500 text-sm mt-0.5 truncate">{reg.email}</p>
                    <p className="text-slate-400 text-xs mt-1 font-mono tracking-tight">{reg.contactNumber}</p>
                  </div>
                </div>

                {/* Middle: Education */}
                <div className="md:w-1/3 flex flex-col justify-center">
                  <p className="text-sm font-semibold text-slate-800">
                    {reg.collegeType === 'Amity' ? 'Amity University' : reg.collegeName}
                  </p>
                  <p className="text-sm text-slate-500 mt-1 font-medium">
                    {reg.courseName} <span className="text-slate-300 mx-1">•</span> {reg.specialisation}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-600">
                      Year {reg.year}
                    </span>
                    {reg.enrollmentNo && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200/50">
                        ID: {reg.enrollmentNo}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right: Motivation & Links */}
                <div className="md:w-1/3 flex flex-col">
                  {reg.motivation ? (
                    <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg text-sm text-slate-600 italic line-clamp-2 mb-3">
                      "{reg.motivation}"
                    </div>
                  ) : (
                    <div className="text-sm text-slate-400 italic mb-3">No motivation provided.</div>
                  )}
                  
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex gap-4">
                      {reg.linkedinUrl && (
                        <a href={reg.linkedinUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">
                          <LinkIcon /> LinkedIn
                        </a>
                      )}
                      {reg.githubUrl && (
                        <a href={reg.githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
                          <LinkIcon /> GitHub
                        </a>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 font-medium">
                      {new Date(reg.registrationDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                </div>
                
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
