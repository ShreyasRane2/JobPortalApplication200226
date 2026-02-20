import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch user role directly if user object is not available
  useEffect(() => {
    const fetchUserRole = async () => {
      if (isAuthenticated && !user) {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get('http://localhost:5454/api/users/me', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          setUserRole(response.data.role);
          console.log('Navbar: Fetched role directly:', response.data.role);
        } catch (error) {
          console.error('Navbar: Failed to fetch role:', error);
        }
      } else if (user) {
        setUserRole(user.role);
      }
    };
    fetchUserRole();
  }, [isAuthenticated, user]);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      if (isAuthenticated && user?.id) {
        try {
          console.log('🔔 Fetching notifications for user ID:', user.id);
          const response = await axios.get(`http://localhost:8086/api/notifications/user/${user.id}`);
          console.log('📬 Notifications fetched:', response.data?.length || 0, 'notifications');
          setNotifications(response.data || []);
          const unread = (response.data || []).filter(n => !n.isRead).length;
          setUnreadCount(unread);
          console.log('📊 Unread count:', unread);
        } catch (error) {
          console.error('❌ Failed to fetch notifications:', error);
          console.error('Error details:', error.response?.data || error.message);
          setNotifications([]);
          setUnreadCount(0);
        }
      }
    };
    
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, user]);

  const isEmployer = (user?.role || userRole) === 'ROLE_EMPLOYER';

  return (
    <nav style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '15px 0', color: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px' }}>
        <Link to="/" style={{ color: 'white', textDecoration: 'none', fontSize: '28px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>💼</span> Job Portal
        </Link>
        <div style={{ display: 'flex', gap: '25px', alignItems: 'center' }}>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" style={{ color: 'white', textDecoration: 'none', fontSize: '16px', transition: 'opacity 0.3s' }} onMouseEnter={(e) => e.target.style.opacity = '0.8'} onMouseLeave={(e) => e.target.style.opacity = '1'}>Dashboard</Link>
              {(user?.role || userRole) === 'ROLE_ADMIN' || (user?.role || userRole) === 'ROLE_ADMINISTRATOR' ? (
                <>
                  <Link to="/admin" style={{ color: 'white', textDecoration: 'none', fontSize: '16px', transition: 'opacity 0.3s' }} onMouseEnter={(e) => e.target.style.opacity = '0.8'} onMouseLeave={(e) => e.target.style.opacity = '1'}>Admin Panel</Link>
                </>
              ) : isEmployer ? (
                <Link to="/post-job" style={{ color: 'white', textDecoration: 'none', fontSize: '16px', transition: 'opacity 0.3s' }} onMouseEnter={(e) => e.target.style.opacity = '0.8'} onMouseLeave={(e) => e.target.style.opacity = '1'}>Add Job</Link>
              ) : (
                <Link to="/jobs" style={{ color: 'white', textDecoration: 'none', fontSize: '16px', transition: 'opacity 0.3s' }} onMouseEnter={(e) => e.target.style.opacity = '0.8'} onMouseLeave={(e) => e.target.style.opacity = '1'}>Jobs</Link>
              )}
              {(user?.role || userRole) !== 'ROLE_ADMIN' && (user?.role || userRole) !== 'ROLE_ADMINISTRATOR' && (
                <>
                  <Link to="/applications" style={{ color: 'white', textDecoration: 'none', fontSize: '16px', transition: 'opacity 0.3s' }} onMouseEnter={(e) => e.target.style.opacity = '0.8'} onMouseLeave={(e) => e.target.style.opacity = '1'}>Applications</Link>
                  <Link to="/profile" style={{ color: 'white', textDecoration: 'none', fontSize: '16px', transition: 'opacity 0.3s' }} onMouseEnter={(e) => e.target.style.opacity = '0.8'} onMouseLeave={(e) => e.target.style.opacity = '1'}>Profile</Link>
                </>
              )}
              {/* Notification Bell */}
              <div style={{ position: 'relative' }}>
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  style={{ 
                    background: 'transparent', 
                    border: 'none', 
                    color: 'white', 
                    fontSize: '24px', 
                    cursor: 'pointer',
                    position: 'relative',
                    padding: '5px'
                  }}
                >
                  🔔
                  {unreadCount > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '0',
                      right: '0',
                      background: '#ff4444',
                      color: 'white',
                      borderRadius: '50%',
                      width: '20px',
                      height: '20px',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold'
                    }}>
                      {unreadCount}
                    </span>
                  )}
                </button>
                
                {/* Notification Dropdown */}
                {showNotifications && (
                  <div style={{
                    position: 'absolute',
                    top: '45px',
                    right: '0',
                    background: 'white',
                    borderRadius: '10px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    width: '350px',
                    maxHeight: '400px',
                    overflowY: 'auto',
                    zIndex: 1000
                  }}>
                    <div style={{
                      padding: '15px',
                      borderBottom: '1px solid #eee',
                      fontWeight: 'bold',
                      color: '#333',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span>Notifications</span>
                      <span style={{ fontSize: '12px', color: '#666', fontWeight: 'normal' }}>
                        {unreadCount} unread
                      </span>
                    </div>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '30px', textAlign: 'center', color: '#999' }}>
                        No notifications yet
                      </div>
                    ) : (
                      notifications.map(notification => (
                        <div 
                          key={notification.id}
                          style={{
                            padding: '15px',
                            borderBottom: '1px solid #f0f0f0',
                            background: notification.isRead ? 'white' : '#f8f9ff',
                            cursor: 'pointer',
                            transition: 'background 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#f0f0f0'}
                          onMouseLeave={(e) => e.currentTarget.style.background = notification.isRead ? 'white' : '#f8f9ff'}
                        >
                          <div style={{ 
                            fontWeight: notification.isRead ? 'normal' : 'bold',
                            color: '#333',
                            marginBottom: '5px',
                            fontSize: '14px'
                          }}>
                            {notification.subject}
                          </div>
                          <div style={{ 
                            color: '#666',
                            fontSize: '13px',
                            marginBottom: '5px'
                          }}>
                            {notification.message}
                          </div>
                          <div style={{ 
                            color: '#999',
                            fontSize: '11px'
                          }}>
                            {new Date(notification.createdAt).toLocaleString()}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
              <button onClick={() => { logout(); navigate('/login'); }} style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid white', padding: '8px 20px', borderRadius: '20px', cursor: 'pointer', fontSize: '16px', transition: 'background 0.3s' }} onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'} onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ color: 'white', textDecoration: 'none', fontSize: '16px' }}>Login</Link>
              <Link to="/register" style={{ background: 'white', color: '#667eea', padding: '8px 20px', borderRadius: '20px', textDecoration: 'none', fontSize: '16px', fontWeight: 'bold' }}>Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
