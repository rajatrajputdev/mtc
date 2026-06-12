import React, { useState, useEffect } from 'react';
import gsap from 'gsap';

const AdminPanel = () => {
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(localStorage.getItem('adminToken') || '');
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

  // Simple Entrance Animation
  useEffect(() => {
    gsap.fromTo(".admin-fade-in", 
      { opacity: 0, y: 30 }, 
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.1 }
    );
  }, [token]);

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
        localStorage.setItem('adminToken', data.token);
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
    localStorage.removeItem('adminToken');
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
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden font-['Gilroy',sans-serif]">
        {/* Background Accents */}
        <div className="absolute top-[20%] left-[10%] w-[400px] h-[400px] bg-[#00a4ef]/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[20%] right-[10%] w-[300px] h-[300px] bg-[#f25022]/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="admin-fade-in max-w-md w-full bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-2xl shadow-2xl relative z-10">
          <div className="mb-8 text-center">
            <div className="inline-block px-3 py-1 mb-4 border border-white/20 rounded-full text-xs font-bold tracking-[0.2em] text-[#00a4ef] uppercase">
              Secure Access
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight">Admin Portal</h2>
            <p className="text-gray-400 mt-2 text-sm">Please authenticate to view registrations</p>
          </div>

          {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm text-center">{error}</div>}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-gray-300 text-xs font-bold uppercase tracking-wider mb-2">Master Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#00a4ef] focus:ring-1 focus:ring-[#00a4ef] transition-all"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black font-bold py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 tracking-wide uppercase text-sm"
            >
              {loading ? 'Authenticating...' : 'Enter System'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-[#f0f0f0] font-['Gilroy',sans-serif] relative overflow-x-hidden pt-[140px] pb-20 px-4 md:px-8">
      {/* Background ambient lighting */}
      <div className="fixed top-0 left-[20%] w-[50vw] h-[50vh] bg-[#00a4ef]/5 rounded-full blur-[150px] pointer-events-none z-0"></div>
      
      <div className="max-w-[1400px] mx-auto relative z-10">
        {/* Header Section */}
        <div className="admin-fade-in flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6 border-b border-white/10 pb-6">
          <div>
            <div className="inline-block px-3 py-1 mb-3 border border-white/20 rounded-full text-xs font-bold tracking-[0.2em] text-[#7fba00] uppercase">
              Live Dashboard
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white">Registration Data</h1>
            <p className="text-gray-400 mt-2">Total signups: {registrations.length}</p>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <button
              onClick={exportToCSV}
              className="bg-[#7fba00] hover:bg-[#8fd300] text-black font-bold px-6 py-2.5 rounded-lg transition-colors flex items-center gap-2 text-sm uppercase tracking-wide"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              Export CSV
            </button>
            <button
              onClick={handleLogout}
              className="bg-transparent border border-white/20 hover:bg-white/10 text-white font-bold px-6 py-2.5 rounded-lg transition-colors text-sm uppercase tracking-wide"
            >
              Logout
            </button>
          </div>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg mb-8">{error}</div>}

        {/* Data Table */}
        <div className="admin-fade-in bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black/40 border-b border-white/10">
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Candidate Info</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">College & Course</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Links</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider hidden md:table-cell">Motivation</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading && registrations.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-16 text-center text-gray-400">Loading secure data...</td>
                  </tr>
                ) : registrations.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-16 text-center text-gray-400">No registrations found yet.</td>
                  </tr>
                ) : (
                  registrations.map((reg) => (
                    <tr key={reg._id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-5">
                        <div className="text-base font-bold text-white group-hover:text-[#00a4ef] transition-colors">{reg.name}</div>
                        <div className="text-sm text-gray-400 mt-1">{reg.email}</div>
                        <div className="text-sm text-gray-500 mt-0.5">{reg.contactNumber}</div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-sm font-semibold text-gray-200">
                          {reg.collegeType === 'Amity' ? 'Amity University' : reg.collegeName}
                        </div>
                        {reg.enrollmentNo && <div className="text-xs text-gray-500 mt-1">ID: {reg.enrollmentNo}</div>}
                        <div className="text-xs text-gray-400 mt-1">
                          <span className="text-[#ffb900]">{reg.courseName}</span> • {reg.specialisation} <br/>
                          (Year {reg.year})
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-2">
                          <a href={reg.linkedinUrl} target="_blank" rel="noreferrer" className="text-xs font-bold text-[#00a4ef] hover:text-white transition-colors bg-[#00a4ef]/10 px-3 py-1 rounded-full inline-block w-max">
                            LinkedIn ↗
                          </a>
                          {reg.githubUrl && (
                            <a href={reg.githubUrl} target="_blank" rel="noreferrer" className="text-xs font-bold text-gray-300 hover:text-white transition-colors bg-white/10 px-3 py-1 rounded-full inline-block w-max">
                              GitHub ↗
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5 hidden md:table-cell">
                        <div className="text-sm text-gray-400 max-w-xs leading-relaxed line-clamp-3">
                          {reg.motivation}
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-gray-500">
                        {new Date(reg.registrationDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
