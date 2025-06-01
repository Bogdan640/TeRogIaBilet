// src/components/TwoFactorSetup.jsx
import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../api/apiInterceptor';
import { API_URL } from '../api/api';

const TwoFactorSetup = () => {
    const [qrCode, setQrCode] = useState('');
    const [secret, setSecret] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const setup2FA = async () => {
            try {
                const response = await fetchWithAuth(`${API_URL}/auth/2fa/setup`);
                const data = await response.json();

                if (data.error) {
                    setError(data.error);
                    return;
                }

                setQrCode(data.qrCode);
                setSecret(data.secret);
            } catch (err) {
                setError('Failed to set up 2FA');
            }
        };

        setup2FA();
    }, []);

    const handleVerify = async (e) => {
        e.preventDefault();

        try {
            const response = await fetchWithAuth(`${API_URL}/auth/2fa/verify`, {
                method: 'POST',
                body: JSON.stringify({ token: verificationCode })
            });

            const data = await response.json();

            if (data.error) {
                setError(data.error);
                return;
            }

            setSuccess(true);
            setError('');
        } catch (err) {
            setError('Failed to verify code');
        }
    };

    return (
        <div className="two-factor-setup">
            <h2>Set Up Two-Factor Authentication</h2>

            {!success ? (
                <>
                    {qrCode && (
                        <div className="qr-container">
                            <p>Scan this QR code with your authenticator app:</p>
                            <img src={qrCode} alt="QR Code" />

                            <p>Or enter this code manually:</p>
                            <code>{secret}</code>
                        </div>
                    )}

                    <form onSubmit={handleVerify}>
                        <div className="form-group">
                            <label>Verification Code</label>
                            <input
                                type="text"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value)}
                                placeholder="Enter the 6-digit code"
                                required
                            />
                        </div>

                        {error && <div className="error-message">{error}</div>}

                        <button type="submit">Verify</button>
                    </form>
                </>
            ) : (
                <div className="success-message">
                    <p>Two-factor authentication has been successfully set up!</p>
                </div>
            )}
        </div>
    );
};

export default TwoFactorSetup;