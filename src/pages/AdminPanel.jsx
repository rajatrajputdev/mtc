import React, { useState, useEffect } from 'react';

const AdminPanel = () => {
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(localStorage.getItem('adminToken') || '');
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Add noindex meta tag to prevent search engines from indexing this hidden route
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

    // Headers
    const headers = [
      'Name', 'Email', 'Contact Number', 'College Type', 'Enrollment No / College Name',
      'Course', 'Specialisation', 'Year', 'LinkedIn', 'GitHub', 'Motivation', 'Registration Date'
    ];

    // Rows
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
      `"${(reg.motivation || '').replace(/"/g, '""')}"`, // Escape double quotes inside text
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
      <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
        <div className="max-w-md w-full bg-gray-800 p-8 rounded-lg shadow-xl border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Admin Access</h2>
          {error && <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded mb-4 text-sm">{error}</div>}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm font-bold mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                placeholder="Enter admin password"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded transition-colors disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 pt-24 md:pt-32">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-gray-900">Registration Data</h1>
          <div className="flex gap-4">
            <button
              onClick={exportToCSV}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              Export to CSV
            </button>
            <button
              onClick={handleLogout}
              className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded shadow transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded mb-6">{error}</div>}

        <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name & Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">College & Course</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Links</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Motivation</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading && registrations.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">Loading data...</td>
                  </tr>
                ) : registrations.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">No registrations found.</td>
                  </tr>
                ) : (
                  registrations.map((reg) => (
                    <tr key={reg._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{reg.name}</div>
                        <div className="text-sm text-gray-500">{reg.email}</div>
                        <div className="text-sm text-gray-500">{reg.contactNumber}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{reg.collegeType === 'Amity' ? 'Amity University' : reg.collegeName}</div>
                        <div className="text-sm text-gray-500">{reg.enrollmentNo && `Enrollment: ${reg.enrollmentNo}`}</div>
                        <div className="text-sm text-gray-500">{reg.courseName} - {reg.specialisation} (Year {reg.year})</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <a href={reg.linkedinUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm truncate max-w-[150px]">LinkedIn</a>
                          {reg.githubUrl && <a href={reg.githubUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm truncate max-w-[150px]">GitHub</a>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs overflow-hidden text-ellipsis display-webkit-box" style={{ WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', display: '-webkit-box' }}>
                          {reg.motivation}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(reg.registrationDate).toLocaleDateString()}
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
