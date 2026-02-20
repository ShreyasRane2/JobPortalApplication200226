import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

function PostJob() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    companyName: '',
    description: '',
    minSalary: '',
    maxSalary: '',
    location: '',
    experience: '',
    jobType: 'FULL_TIME',
    workMode: 'WORK_FROM_OFFICE',
    status: 'OPEN',
    keySkills: []
  });
  const [newSkill, setNewSkill] = useState('');

  // Redirect if not employer
  useEffect(() => {
    if (user && user.role !== 'ROLE_EMPLOYER') {
      alert('Only employers can post jobs');
      navigate('/jobs');
    }
  }, [user, navigate]);

  const addSkill = () => {
    if (newSkill.trim() && !formData.keySkills.includes(newSkill.trim())) {
      setFormData({ ...formData, keySkills: [...formData.keySkills, newSkill.trim()] });
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData({ ...formData, keySkills: formData.keySkills.filter(s => s !== skillToRemove) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.companyName || !formData.description || !formData.location) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch employer email
      const userResponse = await axios.get('http://localhost:5454/api/users/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const employerEmail = userResponse.data.emailId;
      
      // For now, using a default companyId of 1
      // In production, this should come from the employer's profile
      const companyId = 1;
      
      const jobData = {
        title: formData.title,
        companyName: formData.companyName,
        description: formData.description,
        minSalary: formData.minSalary,
        maxSalary: formData.maxSalary,
        location: formData.location,
        experience: parseInt(formData.experience) || 0,
        jobType: formData.jobType,
        workMode: formData.workMode,
        status: formData.status,
        keySkills: formData.keySkills,
        companyId: companyId,
        employerEmail: employerEmail
      };

      await axios.post(`http://localhost:8082/api/admin/jobs?companyId=${companyId}`, jobData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      alert('Job posted successfully!');
      navigate('/jobs');
    } catch (error) {
      console.error('Error posting job:', error);
      alert('Failed to post job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '30px auto', padding: '20px' }}>
      <h1>Add Job</h1>
      <div style={{ background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginTop: '20px' }}>
        <form onSubmit={handleSubmit}>
          {/* Job Title */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
              Job Title <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Senior Java Developer"
              required
              style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px' }}
            />
          </div>

          {/* Company Name */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
              Company Name <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              placeholder="e.g., Tech Solutions Inc."
              required
              style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px' }}
            />
          </div>

          {/* Description */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
              Job Description <span style={{ color: 'red' }}>*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the job role, responsibilities, and requirements..."
              required
              rows="6"
              style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px', fontFamily: 'inherit' }}
            />
          </div>

          {/* Location */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
              Location <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g., Mumbai, India"
              required
              style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px' }}
            />
          </div>

          {/* Salary Range */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
                Min Salary
              </label>
              <input
                type="text"
                value={formData.minSalary}
                onChange={(e) => setFormData({ ...formData, minSalary: e.target.value })}
                placeholder="e.g., 50000"
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
                Max Salary
              </label>
              <input
                type="text"
                value={formData.maxSalary}
                onChange={(e) => setFormData({ ...formData, maxSalary: e.target.value })}
                placeholder="e.g., 80000"
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px' }}
              />
            </div>
          </div>

          {/* Experience */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
              Experience Required (years)
            </label>
            <input
              type="number"
              value={formData.experience}
              onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
              placeholder="e.g., 3"
              min="0"
              style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px' }}
            />
          </div>

          {/* Job Type */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
              Job Type
            </label>
            <select
              value={formData.jobType}
              onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
              style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px' }}
            >
              <option value="FULL_TIME">Full Time</option>
              <option value="PART_TIME">Part Time</option>
              <option value="INTERNSHIP">Internship</option>
            </select>
          </div>

          {/* Work Mode */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
              Work Mode
            </label>
            <select
              value={formData.workMode}
              onChange={(e) => setFormData({ ...formData, workMode: e.target.value })}
              style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px' }}
            >
              <option value="WORK_FROM_OFFICE">Work From Office</option>
              <option value="HYBRID">Hybrid</option>
              <option value="WORK_FROM_HOME">Work From Home</option>
            </select>
          </div>

          {/* Key Skills */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
              Required Skills
            </label>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                placeholder="Add a skill (e.g., Java, React)"
                style={{ flex: 1, padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px' }}
              />
              <button
                type="button"
                onClick={addSkill}
                style={{ padding: '12px 24px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}
              >
                Add
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {formData.keySkills.map((skill, i) => (
                <span key={i} style={{ background: '#e3f2fd', color: '#1976d2', padding: '8px 16px', borderRadius: '20px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    style={{ background: 'none', border: 'none', color: '#1976d2', cursor: 'pointer', fontSize: '18px', padding: 0 }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Submit Buttons */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
            <button
              type="submit"
              disabled={loading}
              style={{ padding: '12px 32px', background: loading ? '#ccc' : '#667eea', color: 'white', border: 'none', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '16px', fontWeight: 'bold' }}
            >
              {loading ? 'Adding...' : 'Add Job'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/jobs')}
              style={{ padding: '12px 32px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PostJob;
