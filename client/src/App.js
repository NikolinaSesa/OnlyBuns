import React from "react";
import { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './style/Login.css';
import loginImage from './images/bunny.jpg';

function App() {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleClick = (e) => {
    e.preventDefault();
    const userCredentials = { email, password };

    if (!email) {
      toast.info("Action blocked: An email address is necessary to log in.");
      return;
    }

    if (!password) {
      toast.info("Action blocked: Please enter your password.");
      return;
    }

    axios
      .post("http://localhost:8000/api/user/login", userCredentials)
      .then(({ data }) => {
        console.log(data);
        localStorage.setItem("accessToken", data);
      })
      .catch((error) => {
        console.log(error.response);
        toast.error(error.response.data)
      })
  }

  return (
    <div className="login-page">
      <div className="login-page__image">
        <img src={loginImage} alt="Login image"></img>
      </div>
      <div className="login-page__form">
        <form>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input type="email" id="email" name="email" placeholder="Please enter email" onChange={(e) => setEmail(e.target.value)} required></input>
          </div>
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input type="password" id="password" name="password" placeholder="Please enter password" onChange={(e) => setPassword(e.target.value)} required></input>
          </div>
          <div className="form-group">
            <button type="submit" onClick={handleClick}>Log In</button>
          </div>
          <div className="extra-section">
            <hr className="line-break"></hr>
            <p>
              Don't have an account?{" "}<a href="/" className="signup-link">Sign up here</a>.
            </p>
          </div>
        </form>
      </div>
      <ToastContainer />
    </div>
  )
}

export default App;
