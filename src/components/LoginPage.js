import './LoginPage.css';
import image from '../images/loginbw.jpg'
import { SlLogin } from "react-icons/sl";

export default function LoginPage({ onLogin }) {
  const handleLogin = () => {
    // Perform authentication logic here (e.g., API call)
    onLogin();
  };

  const handleCreateAccount = () => {
    // Handle account creation logic here
  }

  return (
    <div className="loginContainer"> 
        {/* <form className="form"> */}
          <img src={image} class='loginImg' alt='image' />
          
          <div class='loginPart'>
            <div>
              {/* style is applied to below tag individually */}
							<p class='loginTitle'>Welcome back!</p>
							<p>Log in to your account</p> 
						</div>
            
            <div class='credentialsForLogin'></div>

              <div class='inputField'>
                <input class='loginEmail' type='email' placeholder='' required />
                <label class='emailLabel'>Email</label>
              </div>

              <div class='inputField'>
                <input class='loginEmail' type='password' placeholder='' required />
                <label class='emailLabel'>Password</label>
              </div>

              <div class='loginButton' onClick={handleLogin}>Login<SlLogin /></div>

						<div>
							To register as a new club, <a>click here</a>.
						</div>
          </div>
          

        {/* </form> */}
    </div>
  );
}