import React from 'react';
import './LoginPage.css';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

export default function LoginPage({ onLogin }) {
  const navigate = useNavigate();
  
  const handleLogin = (e) => {
    e.preventDefault()
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');
    if (onLogin) onLogin({email, password});
    // do databse checking
    navigate('/home')
  }
  
  return (
    <div className='login-form'>
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Login to your account</h3>
          <p className="card-description">
            Enter your email below to login to your account
          </p>
        </div>

        <div className="card-content">
          <form className="form" onSubmit={handleLogin}>
            <div className="field-group">
              <div className="field">
                <label htmlFor="email" className="field-label">Email</label>
                <input id="email" type="email" className="input" placeholder="m@example.com" required />
              </div>

              <div className="field">
                <div className="field-row">
                  <label htmlFor="password" className="field-label">Password</label>
                  <a href="#" className="forgot">Forgot your password?</a>
                </div>
                <input id="password" type="password" className="input" required placeholder='password'/>
              </div>

              <div className="field actions">
                <button type="submit" className="btn">Login</button>
                <button type="button" className="btn btn-outline">Signup & Login</button>
                <p className="field-description">For registration of new club, <Link to="/signup">Click here</Link></p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}