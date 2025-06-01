import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Events.css";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Events = () => {
    const navigate = useNavigate();
    const [concertsPerPage, setConcertsPerPage] = useState(3);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedGenres, setSelectedGenres] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState("Date");
    const [selectedCountry, setSelectedCountry] = useState("");
    const [selectedCity, setSelectedCity] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(1000);
    const [concertsData, setConcertsData] = useState([]);
    const [filteredConcerts, setFilteredConcerts] = useState([]);
    const [priceThresholds, setPriceThresholds] = useState({ low: 0, medium: 0, high: 0 });
    const [showCharts, setShowCharts] = useState(false);
    const [showItemsPerPageModal, setShowItemsPerPageModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalCount, setTotalCount] = useState(0);
    const [lastUpdate, setLastUpdate] = useState(0);

    // Filter options
    const [genresList, setGenresList] = useState([]);
    const [orderByOptions, setOrderByOptions] = useState([]);
    const [countries, setCountries] = useState([]);
    const [cities, setCities] = useState({});

    const itemsPerPageOptions = [3, 4, 5, 10, 15];

    const [priceDistributionData, setPriceDistributionData] = useState([]);
    const [genreDistributionData, setGenreDistributionData] = useState([]);
    const [priceTrendData, setPriceTrendData] = useState([]);

    const pollingIntervalRef = useRef(null);
    const analyticsPollingRef = useRef(null);
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

    const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    const API_BASE_URL = `${BASE_URL}/api`;

    // Fetch filter options from the server
    useEffect(() => {
        const fetchFilterOptions = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/filters`);
                if (!response.ok) {
                    throw new Error('Failed to fetch filter options');
                }
                const data = await response.json();
                setGenresList(data.genres);
                setOrderByOptions(data.orderBy);
                setCountries(data.countries);
                setCities(data.cities);
            } catch (error) {
                console.error('Error fetching filter options:', error);
                setError('Failed to load filter options. Please try again later.');
            }
        };

        fetchFilterOptions();
    }, []);

    // Function to fetch concerts based on current filters
    const fetchConcerts = async () => {
        try {
            setIsLoading(true);

            // Build query parameters
            const params = new URLSearchParams();
            if (searchQuery) params.append('search', searchQuery);
            if (selectedGenres.length > 0) params.append('genre', selectedGenres.join(','));
            if (selectedOrder) params.append('orderBy', selectedOrder);
            if (selectedCountry) params.append('country', selectedCountry);
            if (selectedCity) params.append('city', selectedCity);
            params.append('minPrice', minPrice);
            params.append('maxPrice', maxPrice);

            const response = await fetch(`${API_BASE_URL}/concerts?${params.toString()}`);

            if (!response.ok) {
                throw new Error('Failed to fetch concerts');
            }

            const data = await response.json();
            setConcertsData(data.concerts);
            setFilteredConcerts(data.concerts);
            setTotalCount(data.totalCount);
            setPriceThresholds(data.priceThresholds);
            setLastUpdate(data.lastUpdate);
            setError(null);
        } catch (error) {
            console.error('Error fetching concerts:', error);
            setError('Failed to load concerts. Please try again later.');
            setConcertsData([]);
            setFilteredConcerts([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Initial fetch of concerts
    useEffect(() => {
        fetchConcerts();
    }, []);

    // Fetch analytics data
    const fetchAnalyticsData = async () => {
        if (!showCharts) return;

        try {
            const response = await fetch(`${API_BASE_URL}/concerts/analytics`);

            if (!response.ok) {
                throw new Error('Failed to fetch analytics data');
            }

            const data = await response.json();
            setPriceDistributionData(data.priceDistributionData);
            setGenreDistributionData(data.genreDistributionData);
            setPriceTrendData(data.priceTrendData);

            // If the lastUpdate time is newer than what we have, refresh concerts
            if (data.lastUpdate > lastUpdate) {
                fetchConcerts();
            }
        } catch (error) {
            console.error('Error fetching analytics data:', error);
        }
    };

    // Trigger a simulated data update
    const triggerDataUpdate = async () => {
        if (!showCharts) return;

        try {
            await fetch(`${API_BASE_URL}/concerts/simulate-update`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            // After update, fetch fresh data
            fetchAnalyticsData();
        } catch (error) {
            console.error('Error triggering data update:', error);
        }
    };

    // Helper function to find which country a city belongs to
    const getCityCountry = (cityName) => {
        for (const country in cities) {
            if (cities[country].includes(cityName)) {
                return country;
            }
        }
        return null;
    };

    const createSlug = (name) => {
        return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    };

    const navigateToEventDetail = (concert) => {
        const eventSlug = createSlug(concert.name);
        navigate(`/event/${eventSlug}`, { state: { concert } });
    };

    // Function to determine button color based on price
    const getButtonColorClass = (price) => {
        const numericPrice = parseFloat(price.replace('$', ''));
        if (numericPrice <= priceThresholds.low) {
            return "event-button-low";
        } else if (numericPrice <= priceThresholds.medium) {
            return "event-button-medium";
        } else {
            return "event-button-high";
        }
    };

    // Set up polling for data updates when charts are shown
    useEffect(() => {
        if (showCharts) {
            // Fetch initial analytics data
            fetchAnalyticsData();

            // Set up polling intervals
            analyticsPollingRef.current = setInterval(fetchAnalyticsData, 5000); // Poll for analytics every 5 seconds
            pollingIntervalRef.current = setInterval(triggerDataUpdate, 3000); // Trigger updates every 3 seconds
        }

        // Cleanup interval when component unmounts or showCharts changes
        return () => {
            if (analyticsPollingRef.current) {
                clearInterval(analyticsPollingRef.current);
                analyticsPollingRef.current = null;
            }
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
                pollingIntervalRef.current = null;
            }
        };
    }, [showCharts]);

    // Apply filters and recalculate pagination when filterConcerts or filters change
    useEffect(() => {
        // When filter options change, fetch new data
        fetchConcerts();
    }, [selectedGenres, selectedOrder, selectedCountry, selectedCity, searchQuery, minPrice, maxPrice]);

    const handleItemsPerPageChange = (number) => {
        setConcertsPerPage(number);
        setCurrentPage(1);
        setShowItemsPerPageModal(false);
    };

    // Toggle items per page modal
    const toggleItemsPerPageModal = () => {
        setShowItemsPerPageModal(!showItemsPerPageModal);
    };

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

    // Toggle charts visibility
    const toggleCharts = () => {
        setShowCharts(!showCharts);
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
                <div className="charts-toggle">
                    <button
                        data-testid="analytics-toggle-button"
                        className={`chart-toggle-button ${showCharts ? 'active' : ''}`}
                        onClick={toggleCharts}
                    >
                        {showCharts ? 'Hide Analytics' : 'Show Analytics'}
                    </button>
                </div>

                {showCharts && (
                    <div className="charts-container">
                        <h2>Live Event Analytics</h2>
                        <div className="charts-grid">
                            <div className="chart-card">
                                <h3>Price Distribution</h3>
                                <ResponsiveContainer width="100%" height={250}>
                                    <PieChart>
                                        <Pie
                                            data={priceDistributionData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                            label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        >
                                            {priceDistributionData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="chart-card">
                                <h3>Genre Distribution</h3>
                                <ResponsiveContainer width="100%" height={250}>
                                    <BarChart
                                        data={genreDistributionData}
                                        margin={{ top: 5, right: 30, left: 20, bottom: 55 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" tick={{angle: -45, textAnchor: 'end'}} height={60} />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="value" name="Number of Events" fill="#8884d8">
                                            {genreDistributionData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="chart-card">
                                <h3>Price Trends By Date</h3>
                                <ResponsiveContainer width="100%" height={250}>
                                    <LineChart
                                        data={priceTrendData}
                                        margin={{ top: 5, right: 30, left: 20, bottom: 55 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" tick={{angle: -45, textAnchor: 'end'}} height={60} />
                                        <YAxis />
                                        <Tooltip formatter={(value) => ['$' + value.toFixed(2), 'Avg Price']} />
                                        <Legend />
                                        <Line type="monotone" dataKey="price" name="Avg Ticket Price" stroke="#ff7300" activeDot={{ r: 8 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <div className="chart-update-info">
                            <div className="update-indicator pulsing"></div>
                            <span>Live data: Events are being updated from the server ({totalCount} total events)</span>
                        </div>
                    </div>
                )}

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
                                {selectedCountry && cities[selectedCountry] &&
                                    cities[selectedCountry].map((city, index) => (
                                        <option key={index} value={city}>{city}</option>
                                    ))
                                }
                            </select>
                        </div>

                        <div className="filter-group">
                            <label>Price Legend</label>
                            <div className="price-legend">
                                <div className="legend-item">
                                    <div className="color-box green"></div>
                                    <span>Low Price (≤ ${Math.round(priceThresholds.low)})</span>
                                </div>
                                <div className="legend-item">
                                    <div className="color-box yellow"></div>
                                    <span>Medium Price (≤ ${Math.round(priceThresholds.medium)})</span>
                                </div>
                                <div className="legend-item">
                                    <div className="color-box red"></div>
                                    <span>High Price</span>
                                </div>
                            </div>
                        </div>
                    </aside>

                    <main className="event-list">
                        {isLoading ? (
                            <div className="loading-message">Loading concerts...</div>
                        ) : error ? (
                            <div className="error-message">{error}</div>
                        ) : selectedConcerts.length > 0 ? (
                            selectedConcerts.map((concert) => (
                                <div className="event-card" key={concert.id}>
                                    <div className="event-info">
                                        <h3>{concert.name}</h3>
                                        <p>Genre - {concert.genre}</p>
                                        <p>Ticket Price - {concert.price}</p>
                                        <p>Location - {concert.location}</p>
                                        <p>Date - {concert.date}</p>
                                        <button
                                            className={`event-button ${getButtonColorClass(concert.price)}`}
                                            onClick={() => navigateToEventDetail(concert)}
                                        >
                                            See more info
                                        </button>
                                    </div>
                                    <img src={concert.imageUrl || "https://via.placeholder.com/450x180"} alt={concert.name} className="event-image" />
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

                        <div className="pagination-controls">
                            <div className="items-per-page">
                                <button
                                    className="items-per-page-button"
                                    onClick={toggleItemsPerPageModal}
                                >
                                    Items per page: {concertsPerPage} ▼
                                </button>

                                {showItemsPerPageModal && (
                                    <div className="items-per-page-modal">
                                        {itemsPerPageOptions.map(number => (
                                            <button
                                                key={number}
                                                className={`modal-option ${concertsPerPage === number ? 'active' : ''}`}
                                                onClick={() => handleItemsPerPageChange(number)}
                                            >
                                                {number}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

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