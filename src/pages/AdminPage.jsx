import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminPage.css';
import concerts from '../In_memory_storage/Concerts.js'; // Import your concerts data

function AdminPage() {
    const navigate = useNavigate();

    // State for new event form
    const [newEvent, setNewEvent] = useState({
        name: '',
        genre: '',
        price: '',
        location: '',
        date: '',
        imageUrl: ''
    });

    // State for validation errors
    const [errors, setErrors] = useState({});

    // State for success message
    const [successMessage, setSuccessMessage] = useState('');

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewEvent({
            ...newEvent,
            [name]: value
        });

        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: ''
            });
        }
    };

    // Validation function
    const validateForm = () => {
        const newErrors = {};

        // Validate name
        if (newEvent.name.trim().length === 0) {
            newErrors.name = "Event name is required";
        } else if (newEvent.name.length > 50) {
            newErrors.name = "Event name cannot exceed 50 characters";
        }

        // Validate genre
        if (!newEvent.genre) {
            newErrors.genre = "Please select a genre";
        }

        // Validate price format
        if (!/^\$\d+(\.\d{1,2})?$/.test(newEvent.price)) {
            newErrors.price = "Price must be in format $XX or $XX.XX";
        }

        // Validate location
        if (newEvent.location.trim().length === 0) {
            newErrors.location = "Location is required";
        } else if (newEvent.location.length > 100) {
            newErrors.location = "Location cannot exceed 100 characters";
        }

        // Validate date is not in the past
        const selectedDate = new Date(newEvent.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (!newEvent.date) {
            newErrors.date = "Date is required";
        } else if (selectedDate < today) {
            newErrors.date = "Event date cannot be in the past";
        }

        // Validate image URL
        if (!newEvent.imageUrl) {
            newErrors.imageUrl = "Image URL is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();

        if (validateForm()) {
            // Generate a new ID based on the highest existing ID
            const newId = Math.max(...concerts.map(concert => concert.id)) + 1;

            // Create new event object
            const eventToAdd = {
                id: newId,
                ...newEvent
            };

            // Add to concerts array (in a real app, this would be an API call)
            concerts.push(eventToAdd);

            // Show success message
            setSuccessMessage(`Event "${newEvent.name}" has been added successfully!`);

            // Reset form
            setNewEvent({
                name: '',
                genre: '',
                price: '',
                location: '',
                date: '',
                imageUrl: ''
            });

            // Clear success message after 3 seconds
            setTimeout(() => {
                setSuccessMessage('');
            }, 3000);
        }
    };

    // Handle logout
    const handleLogout = () => {
        navigate('/'); // Navigate to home page on logout
    };

    return (
        <div className="dashboard-admin-page">
            <header className="dashboard-admin-header">
                <h1>Admin Dashboard</h1>
                <button onClick={handleLogout} className="dashboard-logout-button">Logout</button>
            </header>

            <div className="dashboard-content-container">
                <div className="dashboard-form-section">
                    <h2>Create New Event</h2>

                    {successMessage && (
                        <div className="dashboard-success-message">{successMessage}</div>
                    )}

                    <form onSubmit={handleSubmit} className="dashboard-event-form">
                        <div className="dashboard-form-group">
                            <label htmlFor="name">Event Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={newEvent.name}
                                onChange={handleInputChange}
                                className={errors.name ? "error-input" : ""}
                                required
                            />
                            {errors.name && <div className="error-message">{errors.name}</div>}
                        </div>

                        <div className="dashboard-form-group">
                            <label htmlFor="genre">Genre</label>
                            <select
                                id="genre"
                                name="genre"
                                value={newEvent.genre}
                                onChange={handleInputChange}
                                className={errors.genre ? "error-input" : ""}
                                required
                            >
                                <option value="">Select Genre</option>
                                <option value="Rock">Rock</option>
                                <option value="Metal">Metal</option>
                                <option value="Alternative Rock">Alternative Rock</option>
                                <option value="Punk">Punk</option>
                            </select>
                            {errors.genre && <div className="error-message">{errors.genre}</div>}
                        </div>

                        <div className="dashboard-form-group">
                            <label htmlFor="price">Price</label>
                            <input
                                type="text"
                                id="price"
                                name="price"
                                placeholder="$XX"
                                value={newEvent.price}
                                onChange={handleInputChange}
                                className={errors.price ? "error-input" : ""}
                                required
                            />
                            {errors.price && <div className="error-message">{errors.price}</div>}
                        </div>

                        <div className="dashboard-form-group">
                            <label htmlFor="location">Location</label>
                            <input
                                type="text"
                                id="location"
                                name="location"
                                value={newEvent.location}
                                onChange={handleInputChange}
                                className={errors.location ? "error-input" : ""}
                                required
                            />
                            {errors.location && <div className="error-message">{errors.location}</div>}
                        </div>

                        <div className="dashboard-form-group">
                            <label htmlFor="date">Date</label>
                            <input
                                type="date"
                                id="date"
                                name="date"
                                value={newEvent.date}
                                onChange={handleInputChange}
                                className={errors.date ? "error-input" : ""}
                                required
                            />
                            {errors.date && <div className="error-message">{errors.date}</div>}
                        </div>

                        <div className="dashboard-form-group">
                            <label htmlFor="imageUrl">Image URL</label>
                            <input
                                type="text"
                                id="imageUrl"
                                name="imageUrl"
                                placeholder="/EventPageImages/your-image.jpg"
                                value={newEvent.imageUrl}
                                onChange={handleInputChange}
                                className={errors.imageUrl ? "error-input" : ""}
                                required
                            />
                            {errors.imageUrl && <div className="error-message">{errors.imageUrl}</div>}
                        </div>

                        <button type="submit" className="dashboard-create-button">Create Event</button>
                    </form>
                </div>

                <div className="dashboard-listing-section">
                    <h2>Current Events ({concerts.length})</h2>
                    <div className="dashboard-events-list">
                        {concerts.map(concert => (
                            <div key={concert.id} className="dashboard-event-item">
                                <div className="dashboard-event-thumbnail">
                                    <img src={concert.imageUrl} alt={concert.name} />
                                </div>
                                <div className="dashboard-event-info">
                                    <h3>{concert.name}</h3>
                                    <p><strong>Genre:</strong> {concert.genre}</p>
                                    <p><strong>Price:</strong> {concert.price}</p>
                                    <p><strong>Location:</strong> {concert.location}</p>
                                    <p><strong>Date:</strong> {new Date(concert.date).toLocaleDateString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminPage;