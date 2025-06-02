// src/pages/SignIn.jsx (updated with QR code integration)
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/SignIn.css';
import { authService } from '../api/authService';
import { API_URL } from '../api/api';

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

    // QR Code states
    const [showQRCode, setShowQRCode] = useState(false);
    const [qrCodeImage, setQrCodeImage] = useState('');

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

                // Fetch QR code for 2FA setup
                await fetchQRCode(response.tempToken);
                setLoading(false);
                return;
            }

            // Regular login success (no 2FA required)
            navigate('/admin');
        } catch (err) {
            setError(err.message || 'Invalid email or password');
            setLoading(false);
        }
    };

    const fetchQRCode = async (token) => {
        try {
            const response = await fetch(`${API_URL}/auth/2fa/qrcode`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (data.error) {
                console.error('QR Code fetch error:', data.error);
                // If QR code fails, still show 2FA input
                return;
            }

            setQrCodeImage(data.qrCode);
            setShowQRCode(true);
        } catch (err) {
            console.error('Failed to fetch QR code:', err);
            // Continue with 2FA even if QR code fails
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

            // Navigate to admin panel
            navigate('/admin');
        } catch (err) {
            setError('Verification failed');
            setLoading(false);
        }
    };

    const handleSkipQR = () => {
        setShowQRCode(false);
    };

    return (
        <div className="signin-page">
            <div className="signin-container">
                <h1>SIGN IN</h1>
                <h2>Ready to rock?</h2>

                {!requireTwoFactor ? (
                    // Initial login form
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
                    // 2FA section
                    <div className="two-factor-section">
                        {showQRCode && qrCodeImage ? (
                            // QR Code display
                            <div className="qr-code-container">
                                <h3>Set Up Two-Factor Authentication</h3>
                                <p>Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.):</p>

                                <div className="qr-code-image">
                                    <img src={qrCodeImage} alt="2FA QR Code" />
                                </div>

                                <p className="qr-instructions">
                                    After scanning, enter the 6-digit verification code from your app below.
                                </p>

                                <button
                                    type="button"
                                    className="skip-qr-button"
                                    onClick={handleSkipQR}
                                >
                                    I've already scanned it
                                </button>
                            </div>
                        ) : null}

                        {/* 2FA Code Input Form - Always visible when requireTwoFactor is true */}
                        <form onSubmit={handleTwoFactorSubmit} className={showQRCode ? 'qr-shown' : ''}>
                            <div className="form-group">
                                <label htmlFor="twoFactorCode">Verification Code</label>
                                <input
                                    type="text"
                                    id="twoFactorCode"
                                    value={twoFactorCode}
                                    onChange={(e) => setTwoFactorCode(e.target.value)}
                                    placeholder="Enter 6-digit code"
                                    maxLength="6"
                                    required
                                />
                            </div>

                            {error && <div className="error-message">{error}</div>}

                            <button
                                type="submit"
                                className="signin-button"
                                disabled={loading || (showQRCode && !twoFactorCode)}
                            >
                                {loading ? 'VERIFYING...' : 'VERIFY & SIGN IN'}
                            </button>
                        </form>

                        {/* Back to login button */}
                        <button
                            type="button"
                            className="back-to-login-button"
                            onClick={() => {
                                setRequireTwoFactor(false);
                                setShowQRCode(false);
                                setQrCodeImage('');
                                setTwoFactorCode('');
                                setError('');
                            }}
                        >
                            Back to Login
                        </button>
                    </div>
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