import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalJobs: 0, applications: 0, interviews: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch total jobs count
      const jobsResponse = await axios.get('http://localhost:8082/api/jobs/simple');
      const totalJobs = jobsResponse.data.length;
      
      // Fetch user's applications if user is logged in
      let applications = 0;
      let interviews = 0;
      
      if (user) {
        try {
          // Get user ID from API if not in context
          let userId = user.id;
          if (!userId) {
            const userResponse = await axios.get('http://localhost:5454/api/users/me', {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            userId = userResponse.data.id;
          }
          
          const appsResponse = await axios.get(`http://localhost:8087/applications/user/${userId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          applications = Array.isArray(appsResponse.data) ? appsResponse.data.length : 0;
          
          // Count interviews (applications with INTERVIEW_SCHEDULED status)
          interviews = Array.isArray(appsResponse.data) ? appsResponse.data.filter(app => 
            app.applicationStatus === 'INTERVIEW_SCHEDULED'
          ).length : 0;
        } catch (error) {
          console.log('Could not fetch applications:', error);
        }
      }
      
      setStats({ totalJobs, applications, interviews });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setStats({ totalJobs: 0, applications: 0, interviews: 0 });
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h2>Loading dashboard...</h2>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '30px auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <div>
          <h1 style={{ marginBottom: '10px' }}>Welcome to Your Dashboard</h1>
          <p style={{ color: '#666' }}>Manage your job search and applications</p>
        </div>
        <button onClick={fetchDashboardStats} style={{ padding: '8px 16px', background: '#667eea', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          🔄 Refresh
        </button>
      </div>
      
      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px', marginTop: '30px' }}>
        <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '25px', borderRadius: '8px', color: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '5px' }}>{stats.totalJobs}</div>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>Available Jobs</div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', padding: '25px', borderRadius: '8px', color: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '5px' }}>{stats.applications}</div>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>My Applications</div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', padding: '25px', borderRadius: '8px', color: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '5px' }}>{stats.interviews}</div>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>Interviews Scheduled</div>
        </div>
      </div>

      {/* Quick Actions */}
      <h2 style={{ marginBottom: '20px' }}>Quick Actions</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
        {user?.role === 'ROLE_EMPLOYER' ? (
          // Employer Quick Actions
          [
            { to: '/post-job', icon: '➕', title: 'Add Job', desc: 'Post a new job opening', color: '#667eea' },
            { to: '/profile', icon: '👤', title: 'My Profile', desc: 'Update your information', color: '#28a745' },
            { to: '/applications', icon: '📝', title: 'Applications', desc: 'View job applications', color: '#ffc107' }
          ].map((item, i) => (
            <Link key={i} to={item.to} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', textAlign: 'center', transition: 'transform 0.3s, box-shadow 0.3s', cursor: 'pointer' }}
                   onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'; }}
                   onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)'; }}>
                <div style={{ fontSize: '48px', marginBottom: '15px' }}>{item.icon}</div>
                <h3 style={{ color: item.color, marginBottom: '8px' }}>{item.title}</h3>
                <p style={{ color: '#666', fontSize: '14px' }}>{item.desc}</p>
              </div>
            </Link>
          ))
        ) : (
          // Job Seeker Quick Actions
          [
            { to: '/jobs', icon: '💼', title: 'Browse Jobs', desc: 'Find your dream job', color: '#007bff' },
            { to: '/profile', icon: '👤', title: 'My Profile', desc: 'Update your information', color: '#28a745' },
            { to: '/applications', icon: '📝', title: 'Applications', desc: 'Track your applications', color: '#ffc107' },
            { to: '/resume', icon: '📄', title: 'Resume', desc: 'Manage your resume', color: '#17a2b8' }
          ].map((item, i) => (
            <Link key={i} to={item.to} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', textAlign: 'center', transition: 'transform 0.3s, box-shadow 0.3s', cursor: 'pointer' }}
                   onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'; }}
                   onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)'; }}>
                <div style={{ fontSize: '48px', marginBottom: '15px' }}>{item.icon}</div>
                <h3 style={{ color: item.color, marginBottom: '8px' }}>{item.title}</h3>
                <p style={{ color: '#666', fontSize: '14px' }}>{item.desc}</p>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

export default Dashboard;
