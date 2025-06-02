// src/pages/SignUp.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/SignIn.css'; // Reuse signin styles or create new ones
import { authService } from '../api/authService';

function SignUp() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validate passwords match
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const response = await authService.register(name, email, password);

            if (response.user && response.token) {
                // Navigate based on role, assuming default role is 'user'
                navigate('/admin');
            }
        } catch (err) {
            setError(err.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="signin-page">
            <div className="signin-container">
                <h1>SIGN UP</h1>
                <h2>Join the community</h2>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Full Name</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

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

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button
                        type="submit"
                        className="signin-button"
                        disabled={loading}
                    >
                        {loading ? 'CREATING ACCOUNT...' : 'SIGN UP'}
                    </button>
                </form>

                <div className="signup-link">
                    <p>Already have an account? <span onClick={() => navigate('/signin')}>SIGN IN</span></p>
                </div>

                <div className="back-link">
                    <p onClick={() => navigate('/')}>Back to home</p>
                </div>
            </div>
        </div>
    );
}

export default SignUp;