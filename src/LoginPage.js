import React from 'react';
import './LoginPage.css';
import vconlogin from './images/vconlogin.jpg';
import googleLogo from './images/googleLogo.svg';
import facebookLogo from './images/facebookLogo.svg';

export default function LoginPage({ onLogin }) {
  const handleLogin = () => {
    // Perform authentication logic here (e.g., API call)
    onLogin();
  };

  const handleCreateAccount = () => {
    // Handle account creation logic here
  }

  return (
    <div className="login-container">
      <img src={vconlogin} alt="Login Visual" className="login-image"/>
      <div className="login-card">
        <h1 className="login-title">VConnect</h1>
        <p className="login-subtitle">A platform connecting students and events</p>
        <form className="login-form">

          <input type="text" id="name" placeholder="Name" />
          <input type="email" id="email" placeholder="Email" />          
          <input type="password" id="password" placeholder="Password" />

          <div>
            <input type='radio' id='sco' value='student' name='sco' />Student
            <input type='radio' id='sco' value='club' name='sco' style={{marginLeft: '20px'}}/>Club
            <input type='radio' id='sco' value='admin' name='sco' style={{marginLeft: '20px'}}/>Admin
          </div>
          
          <div className="login-checkbox">
            <input type="checkbox" id="terms" />
            <label htmlFor="terms">I agree to the Terms & Conditions</label>
          </div>
          
          <div>
            <button type="button" className="login-button" onClick={handleLogin}>
              Login
            </button>
            <button type="button" className="login-button" onClick={handleCreateAccount}>
              Create account
            </button>
          </div>

          <div className="social-login-section">
            <button className="social-login-button">
              <img src={googleLogo} alt="Google Logo" className="social-logo" />
              Google
            </button>
            <button className="social-login-button">
              <img src={facebookLogo} alt="Facebook Logo" className="social-logo" />
              Facebook
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}