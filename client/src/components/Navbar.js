import React from 'react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../style/Navbar.css';

function Navbar({ accessToken, setAccessToken }) {

    const handleLogOut = () => {
        setAccessToken(null);
        localStorage.removeItem("accessToken");
    }

    return (
        <nav className="navbar">
            <h1 className="navbar__title">Only for Bunny Lovers</h1>
            <ul className="navbar__menu">
                <li>
                    <Link to="/posts" className="navbar__link">View Posts</Link>
                </li>
                {!accessToken ? (
                    <li>
                        <Link to="/" className="navbar__link">Log In</Link>
                    </li>
                ) : (
                    <>
                        <li>
                            <Link to="/trends" className="navbar__link">Follow the trends</Link>
                        </li>
                        <li>
                            <Link to="/map" className="navbar__link">Discover the map</Link>
                        </li>
                        <li>
                            <Link to="/chat" className="navbar__link">Start Chat</Link>
                        </li>
                        <li>
                            <Link to="/profile" className="navbar__link">View Profile</Link>
                        </li>
                        <li>
                            <Link to="/" onClick={handleLogOut} className="navbar__link">Log Out</Link>
                        </li>
                    </>
                )}
            </ul>
        </nav>
    );
}

export default Navbar;
