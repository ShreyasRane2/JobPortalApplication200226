import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Register() {
  const [formData, setFormData] = useState({ emailId: '', password: '', fullName: '', role: 'ROLE_EMPLOYEE' });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await register(formData);
    if (result.success) {
      alert('Registration successful! Please login.');
      navigate('/login');
    } else {
      setError(result.error);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '30px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Register</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Full Name</label>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
            required
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Email</label>
          <input
            type="email"
            value={formData.emailId}
            onChange={(e) => setFormData({ ...formData, emailId: e.target.value })}
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
            required
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Password</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
            required
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Role</label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
          >
            <option value="ROLE_EMPLOYEE">Job Seeker</option>
            <option value="ROLE_EMPLOYER">Employer</option>
            <option value="ROLE_ADMINISTRATOR">Administrator</option>
          </select>
        </div>
        {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
        <button type="submit" style={{ width: '100%', padding: '10px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Register
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '15px' }}>
        Already have an account? <Link to="/login">Login here</Link>
      </p>
    </div>
  );
}

export default Register;
