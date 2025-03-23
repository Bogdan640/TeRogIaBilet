import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Events.css";
import concerts from '../In_memory_storage/Concerts.js';
import { genresList, orderByOptions, countries, cities } from '../In_memory_storage/Filters.js';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Events = () => {
    const navigate = useNavigate();
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
    const [priceThresholds, setPriceThresholds] = useState({ low: 0, medium: 0, high: 0 });
    const [showCharts, setShowCharts] = useState(false);

    // Chart data states
    const [priceDistributionData, setPriceDistributionData] = useState([]);
    const [genreDistributionData, setGenreDistributionData] = useState([]);
    const [priceTrendData, setPriceTrendData] = useState([]);

    // For simulating real-time data
    const dataFetchIntervalRef = useRef(null);
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

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

    // Function to calculate price thresholds for the current filtered concerts
    const calculatePriceThresholds = (concerts) => {
        if (concerts.length === 0) return { low: 0, medium: 0, high: 0 };

        // Extract prices and sort them
        const prices = concerts.map(concert => parseFloat(concert.price.replace('$', '')));
        prices.sort((a, b) => a - b);

        // Calculate thresholds - dividing into three approximately equal groups
        const lowThreshold = prices[Math.floor(prices.length / 3)];
        const mediumThreshold = prices[Math.floor(prices.length * 2 / 3)];

        return {
            low: lowThreshold,
            medium: mediumThreshold,
            high: prices[prices.length - 1]
        };
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

    // Generate price distribution data
    const calculatePriceDistributionData = (concerts) => {
        if (concerts.length === 0) return [];

        const lowCount = concerts.filter(concert => parseFloat(concert.price.replace('$', '')) <= priceThresholds.low).length;
        const mediumCount = concerts.filter(concert => {
            const price = parseFloat(concert.price.replace('$', ''));
            return price > priceThresholds.low && price <= priceThresholds.medium;
        }).length;
        const highCount = concerts.filter(concert => parseFloat(concert.price.replace('$', '')) > priceThresholds.medium).length;

        return [
            { name: 'Low', value: lowCount },
            { name: 'Medium', value: mediumCount },
            { name: 'High', value: highCount }
        ];
    };

    // Generate genre distribution data
    const calculateGenreDistributionData = (concerts) => {
        if (concerts.length === 0) return [];

        const genreCounts = {};
        concerts.forEach(concert => {
            if (genreCounts[concert.genre]) {
                genreCounts[concert.genre]++;
            } else {
                genreCounts[concert.genre] = 1;
            }
        });

        return Object.keys(genreCounts).map(genre => ({
            name: genre,
            value: genreCounts[genre]
        }));
    };

    // Simulate price trend data (like ticket price changes over time)
    const generatePriceTrendData = () => {
        // Get dates in ascending order
        const dates = [...new Set(filteredConcerts.map(concert => concert.date))].sort((a, b) => new Date(a) - new Date(b));

        // For each date, calculate average price
        return dates.map(date => {
            const concertsOnDate = filteredConcerts.filter(concert => concert.date === date);
            const avgPrice = concertsOnDate.reduce((sum, concert) => sum + parseFloat(concert.price.replace('$', '')), 0) / concertsOnDate.length;

            // Add some random variation to simulate real-time changes
            const variation = (Math.random() * 20) - 10; // Random value between -10 and 10

            return {
                date: date,
                price: avgPrice + variation
            };
        });
    };

    // Fetch new data asynchronously (simulation)
    const fetchNewData = () => {
        // Simulate asynchronous data fetch with setTimeout
        setTimeout(() => {
            // Update price trend data
            setPriceTrendData(generatePriceTrendData());

            // Add slight variations to other charts
            const updatedPriceDistribution = priceDistributionData.map(item => ({
                ...item,
                value: Math.max(1, item.value + Math.floor(Math.random() * 3) - 1) // Add -1, 0, or 1
            }));
            setPriceDistributionData(updatedPriceDistribution);

            // Update genre distribution occasionally
            if (Math.random() > 0.7) {
                const updatedGenreDistribution = genreDistributionData.map(item => ({
                    ...item,
                    value: Math.max(1, item.value + Math.floor(Math.random() * 3) - 1)
                }));
                setGenreDistributionData(updatedGenreDistribution);
            }
        }, 500); // Simulate network delay
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

        if (selectedGenres.length > 0) {
            result = result.filter(concert => selectedGenres.includes(concert.genre));
        }

        if (selectedCountry) {
            result = result.filter(concert => {
                const concertCity = concert.location;
                const concertCountry = getCityCountry(concertCity);
                return concertCountry === selectedCountry;
            });
        }

        if (selectedCity) {
            result = result.filter(concert => concert.location === selectedCity);
        }

        result = result.filter(concert => {
            const concertPrice = parseFloat(concert.price.replace('$', ''));
            return concertPrice >= minPrice && concertPrice <= maxPrice;
        });

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

        // Calculate new price thresholds based on filtered results
        const newThresholds = calculatePriceThresholds(result);
        setPriceThresholds(newThresholds);

        setFilteredConcerts(result);
        setCurrentPage(1); // Reset to first page when filters change
    }, [selectedGenres, selectedOrder, selectedCountry, selectedCity, searchQuery, minPrice, maxPrice]);

    // Update chart data when filtered concerts change
    useEffect(() => {
        // Generate initial chart data
        setPriceDistributionData(calculatePriceDistributionData(filteredConcerts));
        setGenreDistributionData(calculateGenreDistributionData(filteredConcerts));
        setPriceTrendData(generatePriceTrendData());

        // Setup interval for real-time updates
        if (showCharts) {
            dataFetchIntervalRef.current = setInterval(fetchNewData, 3000);
        }

        // Cleanup interval when component unmounts or filters change
        return () => {
            if (dataFetchIntervalRef.current) {
                clearInterval(dataFetchIntervalRef.current);
            }
        };
    }, [filteredConcerts, showCharts, priceThresholds]);

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
                        className={`chart-toggle-button ${showCharts ? 'active' : ''}`}
                        onClick={toggleCharts}
                    >
                        {showCharts ? 'Hide Analytics' : 'Show Analytics'}
                    </button>
                </div>

                {showCharts && (
                    <div className="charts-container">
                        <h2>Real-Time Event Analytics</h2>
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
                                <h3>Price Trends Over Time</h3>
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
                            <span>Data refreshes automatically every 3 seconds</span>
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
                                {selectedCountry &&
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
                        {selectedConcerts.length > 0 ? (
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