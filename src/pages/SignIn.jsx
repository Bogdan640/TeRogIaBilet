import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/SignIn.css';

function SignIn() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        // Clear any previous error messages
        setError('');

        // Check for admin credentials
        if (email === 'bogdan@ubb.ro' && password === 'melc') {
            console.log('Admin login successful');
            navigate('/admin'); // Redirect to admin page
        } else {
            // Handle regular user login or show error
            console.log('Login attempt with:', email, password);
            setError('Invalid email or password');
        }
    };

    return (
        <div className="signin-page">
            <div className="signin-container">
                <h1>SIGN IN</h1>
                <h2>Ready to rock?</h2>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button type="submit" className="signin-button">SIGN IN</button>
                </form>

                <div className="signup-link">
                    <p>Don't have an account? <span onClick={() => navigate('/signup')}>SIGN UP</span></p>
                </div>

                <div className="back-link">
                    <p onClick={() => navigate('/')}>Back to home</p>
                </div>
            </div>
        </div>
    );
}

export default SignIn;