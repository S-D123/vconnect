import React, { useState } from 'react';
import './LoginPage.css';
import { useNavigate } from 'react-router-dom';

export default function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    clubName: '',
    departmentName: '',
    collegeName: '',
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setForm((s) => ({ ...s, [e.target.id]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Get the token of the logged-in user
      const token = localStorage.getItem('token');
      
      if (!token) {
        setMessage('You must be logged in to register a club.');
        return;
      }

      const response = await fetch('http://localhost:5000/api/clubs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': token // Send the token for authorization
        },
        body: JSON.stringify(form)
      });

      if (response.ok) {
        setMessage('Club registered successfully!');
        setTimeout(() => navigate('/home'), 2000); // Route back to home after 2 seconds
      } else {
        setMessage('Failed to register club. Please try again.');
      }
    } catch (err) {
      console.error(err.message);
      setMessage('Server error.');
    }
  };

  return (
    <div className="login-form">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Club Registration</h3>
          <p className="card-description">
            Enter club details below
          </p>
        </div>

        <div className="card-content">
          <form className="form" onSubmit={handleSubmit}>
            {message && <p style={{ color: message.includes('successfully') ? 'green' : 'red', marginBottom: '10px' }}>{message}</p>}
            
            <div className="field-group">
              <div className="field">
                <label htmlFor="clubName" className="field-label">Club Name</label>
                <input id="clubName" type="text" className="input" value={form.clubName} onChange={handleChange} placeholder="Your Club Name" required />
              </div>

              <div className="field">
                <label htmlFor="departmentName" className="field-label">Department Name</label>
                <input id="departmentName" type="text" className="input" value={form.departmentName} onChange={handleChange} placeholder="Please write 'none' for drama, dance, etc." required />
              </div>

              <div className="field">
                <label htmlFor="collegeName" className="field-label">College Name</label>
                <input id="collegeName" type="text" className="input" value={form.collegeName} onChange={handleChange} placeholder="Your College" required />
              </div>

              <div className="field actions">
                <p className="field-description">Note: You must be logged in as a student first.</p>
                <button type="submit" className="btn">Register Club</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}