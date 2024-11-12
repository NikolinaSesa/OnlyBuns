import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import LogIn from './components/LogIn';
import SignIn from './components/SignIn';
import AllPosts from './components/ViewAllPosts';
import CreatePost from './components/CreatePost';

function App() {
    const [accessToken, setAccessToken] = useState('');

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        setAccessToken(token);
    }, []);

    return (
        <Router>
            <Navbar accessToken={accessToken} setAccessToken={setAccessToken} />
            <Routes>
                <Route path="/" element={<LogIn setAccessToken={setAccessToken} />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/posts" element={<AllPosts accessToken={accessToken} />} />
                <Route path='/createPost' element={<CreatePost />} />
            </Routes>
        </Router>
    );
}

export default App;
