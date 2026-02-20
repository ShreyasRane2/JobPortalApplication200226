import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ResumeUploadSection from '../components/ResumeUploadSection';

function Profile() {
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState('');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Job Seeker Form Data
  const [jobSeekerData, setJobSeekerData] = useState({
    fullName: '', phone: '', skills: '', experience: 0,
    education: '', location: '', linkedinUrl: '', githubUrl: '', aboutMe: ''
  });

  // Employer Form Data
  const [employerData, setEmployerData] = useState({
    companyName: '', description: '', website: '', industry: '',
    companySize: '', foundedYear: '', location: '', contactPhone: '', linkedinUrl: ''
  });

  useEffect(() => {
    fetchUserAndProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUserAndProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const userResponse = await axios.get('http://localhost:5454/api/users/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const email = userResponse.data.emailId;
      const role = userResponse.data.role;
      setUserEmail(email);
      setUserRole(role);
      
      const profileEndpoint = role === 'ROLE_EMPLOYER'
        ? `http://localhost:8088/profile/employer/${email}`
        : `http://localhost:8088/profile/jobseeker/${email}`;
      
      try {
        const profileResponse = await axios.get(profileEndpoint, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setProfile(profileResponse.data);
        
        if (role === 'ROLE_EMPLOYER') {
          setEmployerData({
            companyName: profileResponse.data.companyName || '',
            description: profileResponse.data.description || '',
            website: profileResponse.data.website || '',
            industry: profileResponse.data.industry || '',
            companySize: profileResponse.data.companySize || '',
            foundedYear: profileResponse.data.foundedYear || '',
            location: profileResponse.data.location || '',
            contactPhone: profileResponse.data.contactPhone || '',
            linkedinUrl: profileResponse.data.linkedinUrl || ''
          });
        } else {
          setJobSeekerData({
            fullName: profileResponse.data.fullName || '',
            phone: profileResponse.data.phone || '',
            skills: profileResponse.data.skills || '',
            experience: profileResponse.data.experience || 0,
            education: profileResponse.data.education || '',
            location: profileResponse.data.location || '',
            linkedinUrl: profileResponse.data.linkedinUrl || '',
            githubUrl: profileResponse.data.githubUrl || '',
            aboutMe: profileResponse.data.aboutMe || ''
          });
        }
        setEditing(false);
      } catch (profileError) {
        if (profileError.response?.status === 404) {
          setProfile(null);
          setEditing(true);
        }
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      alert('Failed to load profile');
      setLoading(false);
    }
  };

  // Validation function for URLs
  const validateURL = (url, platform) => {
    if (!url || url.trim() === '') return true;
    
    const urlPattern = /^https?:\/\/.+/i;
    if (!urlPattern.test(url)) {
      return `${platform} URL must start with http:// or https://`;
    }
    
    if (platform === 'LinkedIn') {
      if (!url.includes('linkedin.com')) {
        return 'LinkedIn URL must contain linkedin.com';
      }
    } else if (platform === 'GitHub') {
      if (!url.includes('github.com')) {
        return 'GitHub URL must contain github.com';
      }
    }
    
    return true;
  };


  const handleSaveProfile = async () => {
    try {
      console.log('🔍 Starting validation...');
      console.log('User Role:', userRole);
      
      // Validation
      if (userRole === 'ROLE_EMPLOYER') {
        console.log('Validating Employer Data:', employerData);
        
        if (!employerData.companyName?.trim()) {
          alert('❌ Company Name is required');
          return;
        }
        if (!employerData.industry?.trim()) {
          alert('❌ Industry is required');
          return;
        }
        if (!employerData.description?.trim()) {
          alert('❌ Description is required');
          return;
        }
        if (!employerData.location?.trim()) {
          alert('❌ Location is required');
          return;
        }
        
        const linkedinValidation = validateURL(employerData.linkedinUrl, 'LinkedIn');
        if (linkedinValidation !== true) {
          alert(`❌ ${linkedinValidation}`);
          return;
        }
      } else {
        console.log('Validating Job Seeker Data:', jobSeekerData);
        
        if (!jobSeekerData.fullName?.trim()) {
          alert('❌ Full Name is required');
          return;
        }
        if (!jobSeekerData.phone?.trim()) {
          alert('❌ Phone is required');
          return;
        }
        if (!jobSeekerData.location?.trim()) {
          alert('❌ Location is required');
          return;
        }
        if (!jobSeekerData.skills?.trim()) {
          alert('❌ Skills are required');
          return;
        }
        if (!jobSeekerData.education?.trim()) {
          alert('❌ Education is required');
          return;
        }
        if (!jobSeekerData.aboutMe?.trim()) {
          alert('❌ About Me is required');
          return;
        }
        
        const linkedinValidation = validateURL(jobSeekerData.linkedinUrl, 'LinkedIn');
        if (linkedinValidation !== true) {
          alert(`❌ ${linkedinValidation}`);
          return;
        }
        
        const githubValidation = validateURL(jobSeekerData.githubUrl, 'GitHub');
        if (githubValidation !== true) {
          alert(`❌ ${githubValidation}`);
          return;
        }
      }
      
      console.log('✅ Validation passed! Proceeding to save...');
      
      setSaving(true);
      const token = localStorage.getItem('token');
      let profileData, endpoint, updateEndpoint;
      
      if (userRole === 'ROLE_EMPLOYER') {
        profileData = { email: userEmail, ...employerData };
        endpoint = 'http://localhost:8088/profile/employer';
        updateEndpoint = `http://localhost:8088/profile/employer/${userEmail}`;
      } else {
        profileData = { email: userEmail, ...jobSeekerData };
        endpoint = 'http://localhost:8088/profile/jobseeker';
        updateEndpoint = `http://localhost:8088/profile/jobseeker/${userEmail}`;
      }
      
      try {
        const response = await axios.put(updateEndpoint, profileData, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setProfile(response.data);
        alert('✅ Profile updated successfully!');
      } catch (updateError) {
        if (updateError.response?.status === 404) {
          const response = await axios.post(endpoint, profileData, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          setProfile(response.data);
          alert('✅ Profile created successfully!');
        } else {
          throw updateError;
        }
      }
      setEditing(false);
      setSaving(false);
      await fetchUserAndProfile();
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('❌ Failed to save profile: ' + (error.response?.data?.message || error.message));
      setSaving(false);
    }
  };


  if (loading) return (
    <div style={{ textAlign: 'center', padding: '100px' }}>
      <div style={{ display: 'inline-block', width: '50px', height: '50px', border: '5px solid #f3f3f3', borderTop: '5px solid #667eea', borderRadius: '50%', animation: 'spin 1s linear infinite' }}>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
      <p style={{ marginTop: '20px', color: '#667eea', fontSize: '18px' }}>Loading profile...</p>
    </div>
  );
  
  if (!userEmail) return (
    <div style={{ textAlign: 'center', padding: '100px' }}>
      <div style={{ fontSize: '60px', marginBottom: '20px' }}>⚠️</div>
      <p style={{ color: '#dc3545', fontSize: '18px' }}>Failed to load profile</p>
    </div>
  );

  return (
    <div style={{ maxWidth: '1000px', margin: '30px auto', padding: '20px', minHeight: '100vh' }}>
      {/* Header with Gradient */}
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        padding: '40px', 
        borderRadius: '16px', 
        marginBottom: '30px',
        boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)',
        color: 'white'
      }}>
        <h1 style={{ margin: '0 0 10px 0', fontSize: '36px', fontWeight: 'bold' }}>
          {userRole === 'ROLE_EMPLOYER' ? '🏢 Company Profile' : '👤 My Profile'}
        </h1>
        <p style={{ margin: 0, fontSize: '16px', opacity: 0.9 }}>
          {userRole === 'ROLE_EMPLOYER' ? 'Manage your company information and attract top talent' : 'Build your professional profile and stand out to employers'}
        </p>
      </div>
      
      {!editing && profile ? (
        <ProfileViewMode 
          profile={profile}
          userRole={userRole}
          setEditing={setEditing}
        />
      ) : editing ? (
        <ProfileEditMode
          userRole={userRole}
          profile={profile}
          jobSeekerData={jobSeekerData}
          setJobSeekerData={setJobSeekerData}
          employerData={employerData}
          setEmployerData={setEmployerData}
          handleSaveProfile={handleSaveProfile}
          saving={saving}
          setEditing={setEditing}
          fetchUserAndProfile={fetchUserAndProfile}
        />
      ) : null}
      
      {!profile && !editing && (
        <NoProfileFound setEditing={setEditing} />
      )}

      {/* Resume Upload Section - Only for Job Seekers */}
      {userRole === 'ROLE_EMPLOYEE' && profile && !editing && (
        <ResumeUploadSection userEmail={userEmail} />
      )}
    </div>
  );
}


// Profile View Mode Component
function ProfileViewMode({ profile, userRole, setEditing }) {
  return (
    <div style={{ 
      background: 'white', 
      padding: '40px', 
      borderRadius: '16px', 
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      border: '1px solid #f0f0f0'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-5px)';
      e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.12)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', paddingBottom: '20px', borderBottom: '2px solid #f0f0f0' }}>
        <h2 style={{ margin: 0, fontSize: '24px', color: '#333' }}>
          {userRole === 'ROLE_EMPLOYER' ? '📊 Company Information' : '📝 Profile Details'}
        </h2>
        <button 
          onClick={() => setEditing(true)} 
          style={{ 
            padding: '12px 24px', 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px', 
            cursor: 'pointer',
            fontSize: '15px',
            fontWeight: '600',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
          }}
        >
          ✏️ Edit Profile
        </button>
      </div>
      
      {userRole === 'ROLE_EMPLOYER' ? (
        <EmployerProfileView profile={profile} />
      ) : (
        <JobSeekerProfileView profile={profile} />
      )}
    </div>
  );
}


// Employer Profile View
function EmployerProfileView({ profile }) {
  const fields = [
    { icon: '🏢', label: 'Company Name', value: profile.companyName },
    { icon: '🏭', label: 'Industry', value: profile.industry },
    { icon: '👥', label: 'Company Size', value: profile.companySize },
    { icon: '📍', label: 'Location', value: profile.location },
    { icon: '📞', label: 'Contact Phone', value: profile.contactPhone },
    { icon: '🌐', label: 'Website', value: profile.website },
    { icon: '💼', label: 'LinkedIn', value: profile.linkedinUrl }
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '25px' }}>
      {fields.map((item, index) => (
        <ProfileCard key={index} icon={item.icon} label={item.label} value={item.value} />
      ))}
      <div style={{ gridColumn: '1 / -1', padding: '20px', background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.8)' }}>
        <div style={{ fontSize: '28px', marginBottom: '10px' }}>📄</div>
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px', fontWeight: '600', textTransform: 'uppercase' }}>Description</div>
        <div style={{ fontSize: '15px', color: '#333', lineHeight: '1.6' }}>{profile.description || 'Not provided'}</div>
      </div>
    </div>
  );
}

// Job Seeker Profile View
function JobSeekerProfileView({ profile }) {
  const fields = [
    { icon: '👤', label: 'Full Name', value: profile.fullName },
    { icon: '📧', label: 'Email', value: profile.email },
    { icon: '📞', label: 'Phone', value: profile.phone },
    { icon: '📍', label: 'Location', value: profile.location },
    { icon: '💼', label: 'Experience', value: profile.experience },
    { icon: '🎓', label: 'Education', value: profile.education },
    { icon: '💻', label: 'Skills', value: profile.skills },
    { icon: '🔗', label: 'LinkedIn', value: profile.linkedinUrl },
    { icon: '🐙', label: 'GitHub', value: profile.githubUrl }
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '25px' }}>
      {fields.map((item, index) => (
        <ProfileCard key={index} icon={item.icon} label={item.label} value={item.value} />
      ))}
      <div style={{ gridColumn: '1 / -1', padding: '20px', background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.8)' }}>
        <div style={{ fontSize: '28px', marginBottom: '10px' }}>📝</div>
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px', fontWeight: '600', textTransform: 'uppercase' }}>About Me</div>
        <div style={{ fontSize: '15px', color: '#333', lineHeight: '1.6' }}>{profile.aboutMe || 'Not provided'}</div>
      </div>
    </div>
  );
}

// Profile Card Component
function ProfileCard({ icon, label, value }) {
  return (
    <div style={{
      padding: '20px',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      borderRadius: '12px',
      transition: 'all 0.3s ease',
      cursor: 'default',
      border: '1px solid rgba(255,255,255,0.8)'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'scale(1.05)';
      e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.1)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'scale(1)';
      e.currentTarget.style.boxShadow = 'none';
    }}>
      <div style={{ fontSize: '28px', marginBottom: '10px' }}>{icon}</div>
      <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
      <div style={{ fontSize: '16px', color: '#333', fontWeight: '500', wordBreak: 'break-word' }}>{value || 'Not provided'}</div>
    </div>
  );
}


// Profile Edit Mode Component
function ProfileEditMode({ userRole, profile, jobSeekerData, setJobSeekerData, employerData, setEmployerData, handleSaveProfile, saving, setEditing, fetchUserAndProfile }) {
  return (
    <div style={{ 
      background: 'white', 
      padding: '40px', 
      borderRadius: '16px', 
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      border: '1px solid #f0f0f0'
    }}>
      <div style={{ marginBottom: '30px', paddingBottom: '20px', borderBottom: '2px solid #f0f0f0' }}>
        <h2 style={{ margin: 0, fontSize: '24px', color: '#333' }}>
          {profile ? '✏️ Edit Profile' : '➕ Create Profile'}
        </h2>
        <p style={{ margin: '10px 0 0 0', color: '#666', fontSize: '14px' }}>
          {profile ? 'Update your information below' : 'Fill in your details to create your profile'}
        </p>
      </div>
      
      {userRole === 'ROLE_EMPLOYER' ? (
        <EmployerForm employerData={employerData} setEmployerData={setEmployerData} />
      ) : (
        <JobSeekerForm jobSeekerData={jobSeekerData} setJobSeekerData={setJobSeekerData} />
      )}
      
      <div style={{ marginTop: '30px', display: 'flex', gap: '15px', paddingTop: '20px', borderTop: '2px solid #f0f0f0' }}>
        <button 
          onClick={handleSaveProfile} 
          disabled={saving} 
          style={{ 
            padding: '14px 32px', 
            background: saving ? '#ccc' : 'linear-gradient(135deg, #28a745 0%, #20c997 100%)', 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px', 
            cursor: saving ? 'not-allowed' : 'pointer', 
            fontSize: '16px',
            fontWeight: '600',
            transition: 'all 0.3s ease',
            boxShadow: saving ? 'none' : '0 4px 15px rgba(40, 167, 69, 0.3)',
            opacity: saving ? 0.6 : 1
          }}
          onMouseEnter={(e) => {
            if (!saving) {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(40, 167, 69, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            if (!saving) {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(40, 167, 69, 0.3)';
            }
          }}
        >
          {saving ? '💾 Saving...' : '💾 Save Profile'}
        </button>
        {profile && (
          <button 
            onClick={() => { setEditing(false); fetchUserAndProfile(); }} 
            style={{ 
              padding: '14px 32px', 
              background: 'linear-gradient(135deg, #6c757d 0%, #5a6268 100%)', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px', 
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(108, 117, 125, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(108, 117, 125, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(108, 117, 125, 0.3)';
            }}
          >
            ❌ Cancel
          </button>
        )}
      </div>
    </div>
  );
}


// Employer Form Component
function EmployerForm({ employerData, setEmployerData }) {
  const inputStyle = { 
    width: '100%', 
    padding: '12px 16px', 
    border: '2px solid #e0e0e0', 
    borderRadius: '8px',
    fontSize: '15px',
    transition: 'all 0.3s ease',
    outline: 'none'
  };

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      <FormField label="🏢 Company Name" required>
        <input 
          type="text" 
          value={employerData.companyName} 
          onChange={(e) => setEmployerData({...employerData, companyName: e.target.value})} 
          style={inputStyle}
          onFocus={(e) => e.target.style.borderColor = '#667eea'}
          onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
        />
      </FormField>
      
      <FormField label="🏭 Industry" required>
        <select 
          value={employerData.industry} 
          onChange={(e) => setEmployerData({...employerData, industry: e.target.value})} 
          style={{ ...inputStyle, cursor: 'pointer' }}
          onFocus={(e) => e.target.style.borderColor = '#667eea'}
          onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
        >
          <option value="">Select Industry</option>
          <option value="IT">Information Technology</option>
          <option value="Finance">Finance</option>
          <option value="Healthcare">Healthcare</option>
          <option value="Education">Education</option>
          <option value="Other">Other</option>
        </select>
      </FormField>
      
      <FormField label="👥 Company Size">
        <select 
          value={employerData.companySize} 
          onChange={(e) => setEmployerData({...employerData, companySize: e.target.value})} 
          style={{ ...inputStyle, cursor: 'pointer' }}
          onFocus={(e) => e.target.style.borderColor = '#667eea'}
          onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
        >
          <option value="">Select Size</option>
          <option value="1-10">1-10 employees</option>
          <option value="11-50">11-50 employees</option>
          <option value="51-200">51-200 employees</option>
          <option value="500+">500+ employees</option>
        </select>
      </FormField>
      
      <FormField label="📄 Description" required>
        <textarea 
          value={employerData.description} 
          onChange={(e) => setEmployerData({...employerData, description: e.target.value})} 
          rows="4" 
          style={{ ...inputStyle, fontFamily: 'inherit', resize: 'vertical' }}
          onFocus={(e) => e.target.style.borderColor = '#667eea'}
          onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
        />
      </FormField>
      
      <FormField label="📍 Location" required>
        <input 
          type="text" 
          value={employerData.location} 
          onChange={(e) => setEmployerData({...employerData, location: e.target.value})} 
          placeholder="City, State, Country" 
          style={inputStyle}
          onFocus={(e) => e.target.style.borderColor = '#667eea'}
          onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
        />
      </FormField>
      
      <FormField label="🌐 Website">
        <input 
          type="url" 
          value={employerData.website} 
          onChange={(e) => setEmployerData({...employerData, website: e.target.value})} 
          placeholder="https://example.com" 
          style={inputStyle}
          onFocus={(e) => e.target.style.borderColor = '#667eea'}
          onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
        />
      </FormField>
      
      <FormField label="📞 Contact Phone">
        <input 
          type="tel" 
          value={employerData.contactPhone} 
          onChange={(e) => setEmployerData({...employerData, contactPhone: e.target.value})} 
          style={inputStyle}
          onFocus={(e) => e.target.style.borderColor = '#667eea'}
          onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
        />
      </FormField>
      
      <FormField label="💼 LinkedIn URL">
        <input 
          type="url" 
          value={employerData.linkedinUrl} 
          onChange={(e) => setEmployerData({...employerData, linkedinUrl: e.target.value})} 
          placeholder="https://linkedin.com/company/..." 
          style={inputStyle}
          onFocus={(e) => e.target.style.borderColor = '#667eea'}
          onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
        />
      </FormField>
    </div>
  );
}


// Job Seeker Form Component
function JobSeekerForm({ jobSeekerData, setJobSeekerData }) {
  const inputStyle = { 
    width: '100%', 
    padding: '12px 16px', 
    border: '2px solid #e0e0e0', 
    borderRadius: '8px',
    fontSize: '15px',
    transition: 'all 0.3s ease',
    outline: 'none'
  };

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      <FormField label="👤 Full Name" required>
        <input 
          type="text" 
          value={jobSeekerData.fullName} 
          onChange={(e) => setJobSeekerData({...jobSeekerData, fullName: e.target.value})} 
          style={inputStyle}
          onFocus={(e) => e.target.style.borderColor = '#667eea'}
          onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
        />
      </FormField>
      
      <FormField label="📞 Phone" required>
        <input 
          type="tel" 
          value={jobSeekerData.phone} 
          onChange={(e) => setJobSeekerData({...jobSeekerData, phone: e.target.value})} 
          style={inputStyle}
          onFocus={(e) => e.target.style.borderColor = '#667eea'}
          onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
        />
      </FormField>
      
      <FormField label="📍 Location" required>
        <input 
          type="text" 
          value={jobSeekerData.location} 
          onChange={(e) => setJobSeekerData({...jobSeekerData, location: e.target.value})} 
          placeholder="City, State, Country" 
          style={inputStyle}
          onFocus={(e) => e.target.style.borderColor = '#667eea'}
          onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
        />
      </FormField>
      
      <FormField label="💼 Experience (Years)" required>
        <input 
          type="number" 
          value={jobSeekerData.experience} 
          onChange={(e) => setJobSeekerData({...jobSeekerData, experience: parseInt(e.target.value) || 0})} 
          min="0" 
          style={inputStyle}
          onFocus={(e) => e.target.style.borderColor = '#667eea'}
          onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
        />
      </FormField>
      
      <FormField label="💻 Skills" required>
        <input 
          type="text" 
          value={jobSeekerData.skills} 
          onChange={(e) => setJobSeekerData({...jobSeekerData, skills: e.target.value})} 
          placeholder="Java, React, Python" 
          style={inputStyle}
          onFocus={(e) => e.target.style.borderColor = '#667eea'}
          onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
        />
      </FormField>
      
      <FormField label="🎓 Education" required>
        <textarea 
          value={jobSeekerData.education} 
          onChange={(e) => setJobSeekerData({...jobSeekerData, education: e.target.value})} 
          rows="3" 
          placeholder="Bachelor's in Computer Science" 
          style={{ ...inputStyle, fontFamily: 'inherit', resize: 'vertical' }}
          onFocus={(e) => e.target.style.borderColor = '#667eea'}
          onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
        />
      </FormField>
      
      <FormField label="📝 About Me" required>
        <textarea 
          value={jobSeekerData.aboutMe} 
          onChange={(e) => setJobSeekerData({...jobSeekerData, aboutMe: e.target.value})} 
          rows="4" 
          placeholder="Tell us about yourself..." 
          style={{ ...inputStyle, fontFamily: 'inherit', resize: 'vertical' }}
          onFocus={(e) => e.target.style.borderColor = '#667eea'}
          onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
        />
      </FormField>
      
      <FormField label="🔗 LinkedIn URL">
        <input 
          type="url" 
          value={jobSeekerData.linkedinUrl} 
          onChange={(e) => setJobSeekerData({...jobSeekerData, linkedinUrl: e.target.value})} 
          placeholder="https://linkedin.com/in/yourprofile" 
          style={inputStyle}
          onFocus={(e) => e.target.style.borderColor = '#667eea'}
          onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
        />
      </FormField>
      
      <FormField label="🐙 GitHub URL">
        <input 
          type="url" 
          value={jobSeekerData.githubUrl} 
          onChange={(e) => setJobSeekerData({...jobSeekerData, githubUrl: e.target.value})} 
          placeholder="https://github.com/yourusername" 
          style={inputStyle}
          onFocus={(e) => e.target.style.borderColor = '#667eea'}
          onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
        />
      </FormField>
    </div>
  );
}

// Form Field Component
function FormField({ label, required, children }) {
  return (
    <div>
      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333', fontSize: '14px' }}>
        {label} {required && <span style={{ color: '#dc3545' }}>*</span>}
      </label>
      {children}
    </div>
  );
}

// No Profile Found Component
function NoProfileFound({ setEditing }) {
  return (
    <div style={{ 
      textAlign: 'center', 
      padding: '60px 40px', 
      background: 'white', 
      borderRadius: '16px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      border: '1px solid #f0f0f0'
    }}>
      <div style={{ fontSize: '80px', marginBottom: '20px', animation: 'bounce 2s infinite' }}>
        <style>{`@keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }`}</style>
        📝
      </div>
      <h2 style={{ margin: '0 0 15px 0', fontSize: '28px', color: '#333' }}>No Profile Found</h2>
      <p style={{ margin: '0 0 30px 0', color: '#666', fontSize: '16px' }}>Create your profile to get started and unlock all features</p>
      <button 
        onClick={() => setEditing(true)} 
        style={{ 
          padding: '14px 32px', 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
          color: 'white', 
          border: 'none', 
          borderRadius: '8px', 
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: '600',
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'translateY(-2px)';
          e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
        }}
      >
        ➕ Create Profile
      </button>
    </div>
  );
}

export default Profile;
