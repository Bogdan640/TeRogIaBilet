import React, { useState } from "react";
import "../styles/Events.css";
import concerts from '../In_memory_storage/Concerts.js';
import { genresList, orderByOptions, countries, cities } from '../In_memory_storage/Filters.js';

const Events = () => {
    const concertsPerPage = 3;
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedGenres, setSelectedGenres] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(orderByOptions[0]);
    const [selectedCountry, setSelectedCountry] = useState("");
    const [selectedCity, setSelectedCity] = useState("");

    const totalPages = Math.ceil(concerts.length / concertsPerPage);
    const startIndex = (currentPage - 1) * concertsPerPage;
    const selectedConcerts = concerts.slice(startIndex, startIndex + concertsPerPage);

    const handleGenreChange = (genre) => {
        setSelectedGenres((prev) =>
            prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
        );
    };

    const handleCountryChange = (country) => {
        setSelectedCountry(country);
        setSelectedCity(""); // Reset city selection when changing country
    };

    return (
        <div className="page-wrapper">
            <header className="header">
                <span className="site-name">Site name</span>
                <nav>
                    <a href="#">Page</a>
                    <a href="#">Page</a>
                    <a href="#">Page</a>
                    <button className="header-button">Button</button>
                </nav>
            </header>

            <div className="main-container">
                <div className="content-container">
                    <aside className="sidebar">
                        <input type="text" placeholder="Search" className="search-box" />

                        <div className="filter-group">
                            <label>Order By</label>
                            <select value={selectedOrder} onChange={(e) => setSelectedOrder(e.target.value)}>
                                {orderByOptions.map((option, index) => (
                                    <option key={index} value={option}>{option}</option>
                                ))}
                            </select>
                        </div>

                        <div className="filter-group">
                            <label>Genres</label>
                            <div className="genre-scroll">
                                {genresList.map((genre, index) => (
                                    <div key={index} className="genre-item">
                                        <input
                                            type="checkbox"
                                            id={genre}
                                            checked={selectedGenres.includes(genre)}
                                            onChange={() => handleGenreChange(genre)}
                                        />
                                        <label htmlFor={genre}>{genre}</label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="filter-group">
                            <label>Price Range</label>
                            <input type="range" className="price-range" />
                        </div>

                        <div className="filter-group">
                            <label>Country</label>
                            <select value={selectedCountry} onChange={(e) => handleCountryChange(e.target.value)}>
                                <option value="">Select a Country</option>
                                {countries.map((country, index) => (
                                    <option key={index} value={country}>{country}</option>
                                ))}
                            </select>
                        </div>

                        <div className="filter-group">
                            <label>City</label>
                            <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} disabled={!selectedCountry}>
                                <option value="">Select a City</option>
                                {selectedCountry &&
                                    cities[selectedCountry].map((city, index) => (
                                        <option key={index} value={city}>{city}</option>
                                    ))
                                }
                            </select>
                        </div>
                    </aside>

                    <main className="event-list">
                        {selectedConcerts.map((concert) => (
                            <div className="event-card" key={concert.id}>
                                <div className="event-info">
                                    <h3>{concert.name}</h3>
                                    <p>Genre - {concert.genre}</p>
                                    <p>Ticket Price - {concert.price}$</p>
                                    <p>Location - {concert.location}</p>
                                    <p>Date - {concert.date}</p>
                                    <button className="event-button">See more info</button>
                                </div>
                                <img src={concert.imageUrl} alt={concert.name} className="event-image" />
                            </div>
                        ))}

                        <div className="pagination">
                            <button
                                className="page-button"
                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                            >
                                Prev
                            </button>

                            {[...Array(totalPages)].map((_, index) => (
                                <button
                                    key={index}
                                    className={`page-button ${currentPage === index + 1 ? "active" : ""}`}
                                    onClick={() => setCurrentPage(index + 1)}
                                >
                                    {index + 1}
                                </button>
                            ))}

                            <button
                                className="page-button"
                                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </button>
                        </div>
                    </main>
                </div>
            </div>

            <footer className="footer">
                <span>Add Panel</span>
                <div className="footer-image">[Image]</div>
            </footer>
        </div>
    );
};

export default Events;
