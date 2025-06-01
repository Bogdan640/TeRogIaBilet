import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from "react-router-dom";
import '../styles/AdminPage.css';
import { concertService } from '../api/api.js';
import { authService } from '../api/authService.js';
import { useOfflineSupport } from '../hooks/useOfflineSupport';

function AdminPage() {
    const navigate = useNavigate();

    // State for concerts data
    const [concerts, setConcerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [apiError, setApiError] = useState('');

    // Pagination state
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [totalConcerts, setTotalConcerts] = useState(0);

    // Custom hook for offline support
    const {
        isOnline,
        isServerAvailable,
        pendingOperations,
        addOfflineOperation,
        syncWithServer
    } = useOfflineSupport('concerts');

    // Observer for infinite scroll
    const observer = useRef();
    const lastConcertElementRef = useCallback(node => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore && !loadingMore) {
                setPage(prevPage => prevPage + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, hasMore, loadingMore]);

    // State for new event form
    const [newEvent, setNewEvent] = useState({
        name: '',
        genre: '',
        price: '',
        location: '',
        date: '',
        imageUrl: ''
    });

    // State for tracking selected event
    const [selectedEvent, setSelectedEvent] = useState(null);

    // State for tracking edit mode
    const [isEditMode, setIsEditMode] = useState(false);

    // State for validation errors
    const [errors, setErrors] = useState({});

    // State for success message
    const [successMessage, setSuccessMessage] = useState('');

    // Check authentication when component mounts
    useEffect(() => {
        const user = authService.getCurrentUser();
        if (!user || user.role !== 'admin') {
            console.log('Unauthorized access, redirecting to login');
            navigate('/signin');
            return;
        }

        // If authenticated as admin, fetch initial concerts
        fetchConcerts(1, true);
    }, [navigate]);

    // Effect for loading more data when page changes
    useEffect(() => {
        if (page > 1) {
            fetchMoreConcerts();
        }
    }, [page]);

    // Try to sync with server whenever we come back online
    useEffect(() => {
        if (isOnline && isServerAvailable && pendingOperations.length > 0) {
            syncWithServer().then(() => {
                // Refresh concerts list after successful sync
                fetchConcerts(1, true);
                setSuccessMessage('Successfully synced offline changes with server');
                setTimeout(() => setSuccessMessage(''), 3000);
            }).catch(error => {
                console.error('Error syncing with server:', error);
                setApiError('Failed to sync some changes with the server. Will retry later.');
            });
        }
    }, [isOnline, isServerAvailable, pendingOperations.length]);

    // Main function to fetch concerts (first page or refresh)
    const fetchConcerts = async (pageNum = 1, reset = false) => {
        try {
            setLoading(true);
            console.log(`Fetching concerts page ${pageNum}...`);

            // If we're offline or server is down, load from local storage
            if (!isOnline || !isServerAvailable) {
                const localConcerts = JSON.parse(localStorage.getItem('cachedConcerts') || '[]');
                setConcerts(localConcerts);
                setTotalConcerts(localConcerts.length);
                setHasMore(false);
                setApiError(isOnline ? 'Server is currently unavailable. Working in offline mode.' : 'You are offline. Working with locally cached data.');
                setLoading(false);
                return;
            }

            const data = await concertService.getAll({ page: pageNum, limit: 10 });

            if (reset) {
                setConcerts(data.concerts || []);
            }

            setTotalConcerts(data.totalCount || 0);
            setHasMore(pageNum < (data.totalPages || 1));
            setApiError('');

            // Cache concerts for offline use
            localStorage.setItem('cachedConcerts', JSON.stringify(data.concerts || []));
        } catch (error) {
            console.error('Error fetching concerts:', error);
            setApiError('Failed to load concerts. Please try again.');

            // Try to load from cache if available
            const localConcerts = JSON.parse(localStorage.getItem('cachedConcerts') || '[]');
            if (localConcerts.length > 0) {
                setConcerts(localConcerts);
                setApiError('Failed to connect to server. Using cached data.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Function to fetch more concerts (for pagination)
    const fetchMoreConcerts = async () => {
        if (!isOnline || !isServerAvailable || !hasMore) return;

        try {
            setLoadingMore(true);
            const data = await concertService.getAll({ page, limit: 10 });

            setConcerts(prev => [...prev, ...(data.concerts || [])]);
            setHasMore(page < (data.totalPages || 1));

            // Update the cache with all concerts
            const allConcerts = [...concerts, ...(data.concerts || [])];
            localStorage.setItem('cachedConcerts', JSON.stringify(allConcerts));
        } catch (error) {
            console.error('Error fetching more concerts:', error);
            setApiError('Failed to load more concerts.');
        } finally {
            setLoadingMore(false);
        }
    };

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

    // Handle form submission (create or update event)
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (validateForm()) {
            try {
                if (isEditMode && selectedEvent) {
                    // Update existing event
                    if (isOnline && isServerAvailable) {
                        await concertService.update(selectedEvent.id, newEvent);
                        setSuccessMessage(`Event "${newEvent.name}" has been updated successfully!`);
                    } else {
                        // Store update operation for later syncing
                        addOfflineOperation({
                            type: 'update',
                            id: selectedEvent.id,
                            data: newEvent,
                            timestamp: new Date().toISOString()
                        });

                        // Update local cache
                        const cachedConcerts = JSON.parse(localStorage.getItem('cachedConcerts') || '[]');
                        const updatedConcerts = cachedConcerts.map(c =>
                            c.id === selectedEvent.id ? {...c, ...newEvent} : c
                        );
                        localStorage.setItem('cachedConcerts', JSON.stringify(updatedConcerts));
                        setConcerts(updatedConcerts);

                        setSuccessMessage(`Event "${newEvent.name}" has been updated offline. Will sync when online.`);
                    }
                    setIsEditMode(false);
                } else {
                    // Add new event
                    if (isOnline && isServerAvailable) {
                        const createdEvent = await concertService.create(newEvent);
                        setSuccessMessage(`Event "${newEvent.name}" has been added successfully!`);

                        // Update UI with the new event
                        setConcerts(prev => [createdEvent, ...prev]);
                    } else {
                        // Generate a temporary ID for the new event
                        const tempId = `temp_${Date.now()}`;
                        const tempEvent = { ...newEvent, id: tempId };

                        // Store create operation for later syncing
                        addOfflineOperation({
                            type: 'create',
                            data: newEvent,
                            tempId,
                            timestamp: new Date().toISOString()
                        });

                        // Update local cache
                        const cachedConcerts = JSON.parse(localStorage.getItem('cachedConcerts') || '[]');
                        const updatedConcerts = [tempEvent, ...cachedConcerts];
                        localStorage.setItem('cachedConcerts', JSON.stringify(updatedConcerts));
                        setConcerts(updatedConcerts);

                        setSuccessMessage(`Event "${newEvent.name}" has been added offline. Will sync when online.`);
                    }
                }

                // Reset form
                setNewEvent({
                    name: '',
                    genre: '',
                    price: '',
                    location: '',
                    date: '',
                    imageUrl: ''
                });

                // Reset selected event
                setSelectedEvent(null);

                // Refresh concerts list if online
                if (isOnline && isServerAvailable) {
                    fetchConcerts(1, true);
                }

                // Clear success message after 3 seconds
                setTimeout(() => {
                    setSuccessMessage('');
                }, 3000);
            } catch (error) {
                console.error('Error submitting form:', error);
                setApiError('Failed to save event. Please try again.');
            }
        }
    };

    // Handle event selection
    const handleEventSelect = (concert) => {
        if (selectedEvent && selectedEvent.id === concert.id) {
            // Deselect if already selected
            setSelectedEvent(null);
        } else {
            // Select new event
            setSelectedEvent(concert);
        }
    };

    // Handle edit button click
    const handleEditClick = () => {
        if (selectedEvent) {
            setNewEvent({
                name: selectedEvent.name,
                genre: selectedEvent.genre,
                price: selectedEvent.price,
                location: selectedEvent.location,
                date: selectedEvent.date,
                imageUrl: selectedEvent.imageUrl
            });
            setIsEditMode(true);
            // Scroll to form
            document.querySelector('.dashboard-form-section').scrollIntoView({ behavior: 'smooth' });
        }
    };

    // Handle cancel edit
    const handleCancelEdit = () => {
        setNewEvent({
            name: '',
            genre: '',
            price: '',
            location: '',
            date: '',
            imageUrl: ''
        });
        setIsEditMode(false);
        setSelectedEvent(null);
        setErrors({});
    };

    // Handle remove event
    const handleRemoveEvent = async () => {
        if (selectedEvent) {
            try {
                if (isOnline && isServerAvailable) {
                    await concertService.delete(selectedEvent.id);
                    setSuccessMessage(`Event "${selectedEvent.name}" has been removed successfully!`);

                    // Refresh concerts list
                    fetchConcerts(1, true);
                } else {
                    // Store delete operation for later syncing
                    addOfflineOperation({
                        type: 'delete',
                        id: selectedEvent.id,
                        timestamp: new Date().toISOString()
                    });

                    // Update local cache
                    const cachedConcerts = JSON.parse(localStorage.getItem('cachedConcerts') || '[]');
                    const updatedConcerts = cachedConcerts.filter(c => c.id !== selectedEvent.id);
                    localStorage.setItem('cachedConcerts', JSON.stringify(updatedConcerts));
                    setConcerts(updatedConcerts);

                    setSuccessMessage(`Event "${selectedEvent.name}" has been removed offline. Will sync when online.`);
                }

                setSelectedEvent(null);

                // Clear success message after 3 seconds
                setTimeout(() => {
                    setSuccessMessage('');
                }, 3000);
            } catch (error) {
                console.error('Error removing event:', error);
                setApiError('Failed to remove event. Please try again.');
            }
        }
    };

    // Handle manual sync attempt
    const handleSyncClick = async () => {
        if (!isOnline) {
            setApiError("You're offline. Can't sync with the server.");
            return;
        }

        if (!isServerAvailable) {
            setApiError("Server is unavailable. Can't sync right now.");
            return;
        }

        if (pendingOperations.length === 0) {
            setSuccessMessage("No pending changes to sync.");
            setTimeout(() => setSuccessMessage(''), 3000);
            return;
        }

        try {
            setLoading(true);
            await syncWithServer();
            fetchConcerts(1, true);
            setSuccessMessage(`Successfully synchronized ${pendingOperations.length} offline changes!`);
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Error syncing with server:', error);
            setApiError('Failed to sync changes. Will try again later.');
        } finally {
            setLoading(false);
        }
    };

    // Handle logout
    const handleLogout = () => {
        authService.logout();
        navigate('/'); // Navigate to home page on logout
    };

    // Get connection status class for styling
    const getConnectionStatusClass = () => {
        if (!isOnline) return 'connection-offline';
        if (!isServerAvailable) return 'connection-server-down';
        return 'connection-online';
    };

    // Get connection status text
    const getConnectionStatusText = () => {
        if (!isOnline) return 'Offline';
        if (!isServerAvailable) return 'Server Unavailable';
        return 'Online';
    };

    return (
        <div className="dashboard-admin-page">
            <header className="dashboard-admin-header">
                <h1>Admin Dashboard</h1>
                <div className="dashboard-connection-status">
                    <div className={`connection-indicator ${getConnectionStatusClass()}`}>
                        {getConnectionStatusText()}
                    </div>
                    {pendingOperations.length > 0 && (
                        <div className="pending-operations">
                            {pendingOperations.length} pending {pendingOperations.length === 1 ? 'change' : 'changes'}
                            <button
                                onClick={handleSyncClick}
                                disabled={!isOnline || !isServerAvailable}
                                className="sync-button"
                            >
                                Sync Now
                            </button>
                        </div>
                    )}
                </div>
                <button onClick={handleLogout} className="dashboard-logout-button">Logout</button>
            </header>

            <div className="dashboard-content-container">
                <div className="dashboard-form-section">
                    <h2>{isEditMode ? 'Update Event' : 'Create New Event'}</h2>

                    {successMessage && (
                        <div className="dashboard-success-message">{successMessage}</div>
                    )}

                    {apiError && (
                        <div className="dashboard-error-message">{apiError}</div>
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

                        <div className="dashboard-form-buttons">
                            <button type="submit"
                                    className="dashboard-create-button"
                                    data-testid={isEditMode ? "update-event-button" : "create-event-button"}>
                                {isEditMode ? 'Update Event' : 'Create Event'}
                            </button>
                            {isEditMode && (
                                <button
                                    type="button"
                                    className="dashboard-cancel-button"
                                    onClick={handleCancelEdit}
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                <div className="dashboard-listing-section">
                    <h2>Current Events ({totalConcerts})</h2>

                    {loading && !loadingMore && <div className="dashboard-loading">Loading...</div>}

                    {apiError && (
                        <div className="dashboard-error-message">{apiError}</div>
                    )}

                    {concerts.length === 0 && !loading && (
                        <div className="dashboard-no-events">No events found.</div>
                    )}

                    {concerts.length > 0 && (
                        <div className="dashboard-action-buttons">
                            <button
                                onClick={handleEditClick}
                                disabled={!selectedEvent}
                                className={`dashboard-edit-button ${!selectedEvent ? 'dashboard-button-disabled' : ''}`}
                            >
                                Edit Selected
                            </button>
                            <button
                                onClick={handleRemoveEvent}
                                disabled={!selectedEvent}
                                className={`dashboard-remove-button ${!selectedEvent ? 'dashboard-button-disabled' : ''}`}
                            >
                                Remove Selected
                            </button>
                        </div>
                    )}

                    <div className="dashboard-events-list">
                        {concerts.map((concert, index) => {
                            // Check if this is the last element to attach the ref for infinite scrolling
                            if (concerts.length === index + 1) {
                                return (
                                    <div
                                        ref={lastConcertElementRef}
                                        key={concert.id}
                                        className={`dashboard-event-item ${selectedEvent && selectedEvent.id === concert.id ? 'dashboard-event-selected' : ''} ${concert.id.toString().startsWith('temp_') ? 'dashboard-event-pending' : ''}`}
                                        onClick={() => handleEventSelect(concert)}
                                    >
                                        <div className="dashboard-event-thumbnail">
                                            <img src={concert.imageUrl} alt={concert.name} />
                                        </div>
                                        <div className="dashboard-event-info">
                                            <h3>{concert.name}</h3>
                                            <p><strong>Genre:</strong> {concert.genre}</p>
                                            <p><strong>Price:</strong> {concert.price}</p>
                                            <p><strong>Location:</strong> {concert.location}</p>
                                            <p><strong>Date:</strong> {new Date(concert.date).toLocaleDateString()}</p>
                                            {concert.id.toString().startsWith('temp_') && (
                                                <div className="event-pending-badge">Pending sync</div>
                                            )}
                                        </div>
                                    </div>
                                );
                            } else {
                                return (
                                    <div
                                        key={concert.id}
                                        className={`dashboard-event-item ${selectedEvent && selectedEvent.id === concert.id ? 'dashboard-event-selected' : ''} ${concert.id.toString().startsWith('temp_') ? 'dashboard-event-pending' : ''}`}
                                        onClick={() => handleEventSelect(concert)}
                                    >
                                        <div className="dashboard-event-thumbnail">
                                            <img src={concert.imageUrl} alt={concert.name} />
                                        </div>
                                        <div className="dashboard-event-info">
                                            <h3>{concert.name}</h3>
                                            <p><strong>Genre:</strong> {concert.genre}</p>
                                            <p><strong>Price:</strong> {concert.price}</p>
                                            <p><strong>Location:</strong> {concert.location}</p>
                                            <p><strong>Date:</strong> {new Date(concert.date).toLocaleDateString()}</p>
                                            {concert.id.toString().startsWith('temp_') && (
                                                <div className="event-pending-badge">Pending sync</div>
                                            )}
                                        </div>
                                    </div>
                                );
                            }
                        })}
                    </div>

                    {loadingMore && (
                        <div className="loading-more">Loading more events...</div>
                    )}

                    {!hasMore && concerts.length > 0 && (
                        <div className="end-of-results">End of results</div>
                    )}
                </div>
            </div>

            <footer className="dashboard-admin-footer">
                <p>&copy; {new Date().getFullYear()} Your Company. All rights reserved.</p>
            </footer>
        </div>
    );
}

export default AdminPage;