import React, { useState, useEffect } from "react";
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
    const [searchQuery, setSearchQuery] = useState("");
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(1000);
    const [filteredConcerts, setFilteredConcerts] = useState([...concerts]);

    // Helper function to find which country a city belongs to
    const getCityCountry = (cityName) => {
        for (const country in cities) {
            if (cities[country].includes(cityName)) {
                return country;
            }
        }
        return null;
    };

    // Apply filters whenever any filter changes
    useEffect(() => {
        let result = [...concerts];

        // Apply search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(concert =>
                concert.name.toLowerCase().includes(query) ||
                concert.genre.toLowerCase().includes(query) ||
                concert.location.toLowerCase().includes(query)
            );
        }

        // Apply genre filter
        if (selectedGenres.length > 0) {
            result = result.filter(concert => selectedGenres.includes(concert.genre));
        }

        // Apply country filter
        if (selectedCountry) {
            result = result.filter(concert => {
                const concertCity = concert.location;
                const concertCountry = getCityCountry(concertCity);
                return concertCountry === selectedCountry;
            });
        }

        // Apply city filter
        if (selectedCity) {
            result = result.filter(concert => concert.location === selectedCity);
        }

        // Apply price filter
        result = result.filter(concert => {
            const concertPrice = parseFloat(concert.price.replace('$', ''));
            return concertPrice >= minPrice && concertPrice <= maxPrice;
        });

        // Apply sorting
        switch(selectedOrder) {
            case "Price":
                result.sort((a, b) => {
                    // Remove $ sign and convert to number
                    const priceA = parseFloat(a.price.replace('$', ''));
                    const priceB = parseFloat(b.price.replace('$', ''));
                    return priceA - priceB;
                });
                break;
            case "Date":
                result.sort((a, b) => new Date(a.date) - new Date(b.date));
                break;
            case "Location":
                result.sort((a, b) => a.location.localeCompare(b.location));
                break;
            default:
                // Default to date sorting
                result.sort((a, b) => new Date(a.date) - new Date(b.date));
        }

        setFilteredConcerts(result);
        setCurrentPage(1); // Reset to first page when filters change
    }, [selectedGenres, selectedOrder, selectedCountry, selectedCity, searchQuery, minPrice, maxPrice]);

    // Calculate pagination
    const totalPages = Math.ceil(filteredConcerts.length / concertsPerPage);
    const startIndex = (currentPage - 1) * concertsPerPage;
    const selectedConcerts = filteredConcerts.slice(startIndex, startIndex + concertsPerPage);

    const handleGenreChange = (genre) => {
        setSelectedGenres((prev) =>
            prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
        );
    };

    const handleCountryChange = (country) => {
        setSelectedCountry(country);
        setSelectedCity(""); // Reset city selection when changing country
    };

    // Handle min price change, ensuring it's not higher than max price
    const handleMinPriceChange = (value) => {
        const newMinPrice = Math.min(value, maxPrice);
        setMinPrice(newMinPrice);
    };

    // Handle max price change, ensuring it's not lower than min price
    const handleMaxPriceChange = (value) => {
        const newMaxPrice = Math.max(value, minPrice);
        setMaxPrice(newMaxPrice);
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
                        <input
                            type="text"
                            placeholder="Search"
                            className="search-box"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />

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
                            <label>Price Range: ${minPrice} - ${maxPrice}</label>
                            <div className="price-slider-container">
                                <input
                                    type="range"
                                    min="0"
                                    max="1000"
                                    step="10"
                                    value={minPrice}
                                    onChange={(e) => handleMinPriceChange(Number(e.target.value))}
                                    className="price-range min-price"
                                />
                                <input
                                    type="range"
                                    min="0"
                                    max="1000"
                                    step="10"
                                    value={maxPrice}
                                    onChange={(e) => handleMaxPriceChange(Number(e.target.value))}
                                    className="price-range max-price"
                                />
                            </div>
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
                        {selectedConcerts.length > 0 ? (
                            selectedConcerts.map((concert) => (
                                <div className="event-card" key={concert.id}>
                                    <div className="event-info">
                                        <h3>{concert.name}</h3>
                                        <p>Genre - {concert.genre}</p>
                                        <p>Ticket Price - {concert.price}</p>
                                        <p>Location - {concert.location}</p>
                                        <p>Date - {concert.date}</p>
                                        <button className="event-button">See more info</button>
                                    </div>
                                    <img src={concert.imageUrl} alt={concert.name} className="event-image" />
                                </div>
                            ))
                        ) : (
                            <div className="event-card">
                                <div className="event-info">
                                    <h3>No events found</h3>
                                    <p>Try adjusting your filters</p>
                                </div>
                            </div>
                        )}

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