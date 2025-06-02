// src/pages/SignIn.jsx (updated)
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/SignIn.css';
import { authService } from '../api/authService';

function SignIn() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // 2FA states
    const [requireTwoFactor, setRequireTwoFactor] = useState(false);
    const [userId, setUserId] = useState(null);
    const [tempToken, setTempToken] = useState(null);
    const [twoFactorCode, setTwoFactorCode] = useState('');

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await authService.login(email, password);

            if (response.requireTwoFactor) {
                // Handle 2FA challenge
                setRequireTwoFactor(true);
                setUserId(response.userId);
                setTempToken(response.tempToken);
                setLoading(false);
                return;
            }

            // Regular login success
            if (response.user && response.user.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/admin');
            }
        } catch (err) {
            setError(err.message || 'Invalid email or password');
            setLoading(false);
        }
    };

    const handleTwoFactorSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/auth/2fa/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${tempToken}`
                },
                body: JSON.stringify({
                    userId,
                    token: twoFactorCode
                })
            });

            const data = await response.json();

            if (data.error) {
                setError(data.error);
                setLoading(false);
                return;
            }

            // Store the final token and user info
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            // Navigate based on role
            if (data.user && data.user.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/admin');
            }
        } catch (err) {
            setError('Verification failed');
            setLoading(false);
        }
    };

    return (
        <div className="signin-page">
            <div className="signin-container">
                <h1>SIGN IN</h1>
                <h2>Ready to rock?</h2>

                {!requireTwoFactor ? (
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

                        <button
                            type="submit"
                            className="signin-button"
                            disabled={loading}
                        >
                            {loading ? 'SIGNING IN...' : 'SIGN IN'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleTwoFactorSubmit}>
                        <div className="form-group">
                            <label htmlFor="twoFactorCode">Verification Code</label>
                            <input
                                type="text"
                                id="twoFactorCode"
                                value={twoFactorCode}
                                onChange={(e) => setTwoFactorCode(e.target.value)}
                                placeholder="Enter 6-digit code"
                                required
                            />
                        </div>

                        {error && <div className="error-message">{error}</div>}

                        <button
                            type="submit"
                            className="signin-button"
                            disabled={loading}
                        >
                            {loading ? 'VERIFYING...' : 'VERIFY'}
                        </button>
                    </form>
                )}

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