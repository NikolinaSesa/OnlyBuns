import React from 'react';
import { useState } from 'react';
import signInImage from '../images/bunny_Image.jpg';
import { ToastContainer, toast } from 'react-toastify';
import '../style/Signin.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function SignIn() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmed, setPasswordConfirmed] = useState('');
    const [address, setAddress] = useState('');
    const [number, setNumber] = useState('');
    const [city, setCity] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');

    const navigate = useNavigate();

    const handleClick = (e) => {
        e.preventDefault();

        if(!firstName || !lastName || !username || !email){
            toast.info("Action blocked: Please enter all required values.");
            return;
        }

        if(password !== passwordConfirmed){
            toast.error("Action blocked: Password confirmation does not match. Please ensure both passwords are the same.");
            return;
        }

        const user = {
            first_name: firstName,
            last_name: lastName,
            username: username,
            email: email,
            password: password,
            phone_number: phoneNumber,
            address: address,
            number: number, 
            city: city
        }

        axios
            .post("http://localhost:8000/api/user/register", user)
            .then(({ data }) => {
                console.log(data);
                toast.success("Registration successful.");
                navigate('/')
            })
            .catch((error) => {
                console.log(error.response);
                toast.error(error?.response?.data)
            })
    }

    return (
        <div className="sign-in-page">
            <div className="sign-in-page__image">
                <img src={signInImage} alt="Sign In" />
            </div>
            <div className="sign-in-page__form">
                <form>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="firstName">First Name</label>
                            <input type="text" id="firstName" name="firstName" onChange={(e) => setFirstName(e.target.value)} required />
                        </div>
                        <div className="form-group">

                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <input type="password" id="confirmPassword" name="confirmPassword"  onChange={(e) => setPasswordConfirmed(e.target.value)}required />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="lastName">Last Name</label>
                            <input type="text" id="lastName" name="lastName" onChange={(e) => setLastName(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="address">Address</label>
                            <input type="text" id="address" name="address" onChange={(e) => setAddress(e.target.value)} />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="password">Username</label>
                            <input type="text" id="username" name="username" onChange={(e) => setUsername(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="number">Number</label>
                            <input type="text" id="number" name="number" onChange={(e) => setNumber(e.target.value)} />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input type="email" id="email" name="email" onChange={(e) => setEmail(e.target.value)} required />
                        </div>

                        <div className="form-group">
                            <label htmlFor="city">City</label>
                            <input type="text" id="city" name="city" onChange={(e) => setCity(e.target.value)} />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input type="password" id="password" name="password" onChange={(e) => setPassword(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="phoneNumber">Phone Number</label>
                            <input type="text" id="phoneNumber" name="phoneNumber" onChange={(e) => setPhoneNumber(e.target.value)} />
                        </div>
                    </div>
                    <div className='form-group'>
                        <button type="submit" onClick={handleClick}>Sign In</button>
                    </div>
                    <div className="extra-section_signin">
                        <hr className="line-break_signin"></hr>
                        <p>
                            You already have an accouns?{" "}<a href="/" className="login-link">Log in here</a>.
                        </p>
                    </div>
                </form>
            </div>
            <ToastContainer />
        </div>
    )
}

export default SignIn;