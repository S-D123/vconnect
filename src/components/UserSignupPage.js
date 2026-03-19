import React, { useState } from 'react';
import './LoginPage.css'; // Reusing your existing CSS
import { Link, useNavigate } from 'react-router-dom';

export default function UserSignupPage() {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get('name');
    const email = formData.get('email');
    const password = formData.get('password');

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const parseRes = await response.json();

      if (response.ok) {
        // Automatically log them in after registration
        localStorage.setItem('token', parseRes.token);
        localStorage.setItem('user', JSON.stringify(parseRes.user));
        navigate('/home');
      } else {
        setError(parseRes); // e.g., "User already exists!"
      }
    } catch (err) {
      console.error(err.message);
      setError('Server error. Please try again later.');
    }
  };

  return (
    <div className='login-form'>
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Create an Account</h3>
          <p className="card-description">
            Sign up to join the campus community
          </p>
        </div>

        <div className="card-content">
          <form className="form" onSubmit={handleRegister}>
            {error && <p style={{ color: 'red', fontSize: '14px', marginBottom: '10px' }}>{error}</p>}
            <div className="field-group">
              
              <div className="field">
                <label htmlFor="name" className="field-label">Full Name</label>
                <input id="name" name="name" type="text" className="input" placeholder="John Doe" required />
              </div>

              <div className="field">
                <label htmlFor="email" className="field-label">Email</label>
                <input id="email" name="email" type="email" className="input" placeholder="m@example.com" required />
              </div>

              <div className="field">
                <label htmlFor="password" className="field-label">Password</label>
                <input id="password" name="password" type="password" className="input" required placeholder='Create a secure password'/>
              </div>

              <div className="field actions">
                <button type="submit" className="btn">Sign Up</button>
                <p className="field-description">Already have an account? <Link to="/login">Login here</Link></p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}