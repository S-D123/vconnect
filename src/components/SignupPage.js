import React, { useState } from 'react';
import { IoInformationCircleOutline } from "react-icons/io5";
import './LoginPage.css';
import { useNavigate } from 'react-router-dom';

export default function SignupPage({ onSubmit }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    clubName: '',
    departmentName: '',
    collegeName: '',
  });

  const handleChange = (e) => {
    setForm((s) => ({ ...s, [e.target.id]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // minimal behavior: caller can handle registration via onSubmit
    if (onSubmit) onSubmit(form);
    console.log('Club registration data:', form);
    navigate('/login');
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
            <div className="field-group">
              <div className="field">
                <label htmlFor="clubName" className="field-label">Club Name</label>
                <input id="clubName" type="text" className="input" value={form.clubName} onChange={handleChange} placeholder="Your Club Name" required />
              </div>

              <div className="field">
                <label htmlFor="departmentName" className="field-label">
                  Department Name
                </label>
                <input id="departmentName" type="text" className="input" value={form.departmentName} onChange={handleChange} placeholder="Please write 'none' for drama, dance, or other clubs" required />
              </div>

              <div className="field">
                <label htmlFor="collegeName" className="field-label">College Name</label>
                <input id="collegeName" type="text" className="input" value={form.collegeName} onChange={handleChange} placeholder="Your College" required />
              </div>

              <div className="field actions">
                <p className="field-description">Note: You can login only after admin approves the request.</p>
                <button type="submit" className="btn" onClick={handleSubmit}>Register Club</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}