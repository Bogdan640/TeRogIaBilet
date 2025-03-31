import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/SignIn.css';
import { authService } from '../api/api';

function SignIn() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Clear any previous error messages
        setError('');
        setLoading(true);

        try {
            const response = await authService.login(email, password);

            // Store user info in localStorage
            localStorage.setItem('user', JSON.stringify(response.user));

            // Check if the user is admin
            if (response.user && response.user.role === 'admin') {
                console.log('Admin login successful');
                navigate('/admin');
            } else {
                console.log('User login successful');
                navigate('/events'); // Redirect regular users to events page
            }
        } catch (err) {
            console.error('Login failed:', err);
            setError(err.message || 'Invalid email or password');
        } finally {
            setLoading(false);
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

                    <button
                        type="submit"
                        className="signin-button"
                        disabled={loading}
                    >
                        {loading ? 'SIGNING IN...' : 'SIGN IN'}
                    </button>
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