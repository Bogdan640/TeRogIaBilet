import React from "react";
import {  useLocation, useNavigate } from "react-router-dom";
import "../styles/EventDetail.css"; // We'll create this next

const EventDetail = () => {
    //const { eventSlug } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    // Get concert data from the location state (passed during navigation)
    const concertData = location.state?.concert;

    // If no data was passed in the location state, redirect back to events page
    if (!concertData) {
        // In a real app, you might want to fetch the event data from an API using the eventSlug
        navigate("/events");
        return null;
    }

    return (
        <div className="page-wrapper">
            <header className="header">
                <span className="site-name">Site name</span>
                <nav>
                    <a href="#">Page</a>
                    <a href="#">Page</a>
                    <a href="#">Page</a>
                    <button className="header-button" onClick={() => navigate("/events")}>Back to Events</button>
                </nav>
            </header>

            <div className="main-container">
                <div className="event-detail-container">
                    <div className="event-detail-header">
                        <h1>{concertData.name}</h1>
                        <p className="event-genre">Genre: {concertData.genre}</p>
                    </div>

                    <div className="event-detail-content">
                        <div className="event-detail-image-container">
                            <img src={concertData.imageUrl} alt={concertData.name} className="event-detail-image" />
                        </div>

                        <div className="event-detail-info">
                            <div className="info-section">
                                <h3>Event Details</h3>
                                <p><strong>Date:</strong> {concertData.date}</p>
                                <p><strong>Location:</strong> {concertData.location}</p>
                                <p><strong>Ticket Price:</strong> {concertData.price}</p>
                            </div>

                            <div className="info-section">
                                <h3>About this Event</h3>
                                <p>{concertData.description || "Experience the electrifying performance of " + concertData.name + " live in concert! Don't miss this unforgettable show that promises to deliver an amazing musical experience for all fans."}</p>
                            </div>

                            <div className="action-buttons">
                                <button className="purchase-button">Buy Tickets</button>
                                <button className="share-button">Share Event</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <footer className="footer">
                <span>Add Panel</span>
                <div className="footer-image">[Image]</div>
            </footer>
        </div>
    );
};

export default EventDetail;