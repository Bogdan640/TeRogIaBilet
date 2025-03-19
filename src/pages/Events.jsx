import React from "react";
import "../styles/Events.css";

const MainPage = () => {
    return (
        <div className="main-container">
            <header className="header">
                <span className="site-name">Site name</span>
                <nav>
                    <a href="#">Page</a>
                    <a href="#">Page</a>
                    <a href="#">Page</a>
                    <button className="header-button">Button</button>
                </nav>
            </header>

            <div className="content-container">
                <aside className="sidebar">
                    <input type="text" placeholder="Search" className="search-box" />
                    <label>Order By</label>
                    <select>
                        <option>Date</option>
                    </select>
                    <div className="filters">
                        <label>Genre</label>
                        <div>
                            <input type="checkbox" id="hard-rock" />
                            <label htmlFor="hard-rock">Hard Rock</label>
                        </div>
                        <div>
                            <input type="checkbox" id="alt-rock" />
                            <label htmlFor="alt-rock">Alternative Rock</label>
                        </div>
                        <label>Price Range</label>
                        <input type="range" className="price-range" />
                        <label>Country</label>
                        <select><option>Select</option></select>
                        <label>City</label>
                        <select><option>Select</option></select>
                    </div>
                </aside>

                <main className="event-list">
                    {["Concert 1", "Festival 2", "Concert 3"].map((event, index) => (
                        <div className="event-card" key={index}>
                            <div className="event-info">
                                <h3>{event}</h3>
                                <p>Genre - Rock</p>
                                <p>Ticket Price - {index * 25 + 25}$</p>
                                <p>Location - London, York</p>
                                <p>Date - 02.03.2025</p>
                                <button className="event-button">See more info</button>
                            </div>
                            <div className="event-image">[Image]</div>
                        </div>
                    ))}
                    <div className="pagination">
                        <button className="page-button">1</button>
                        <button className="page-button">2</button>
                        <button className="page-button">3</button>
                        <span>...</span>
                        <button className="page-button">68</button>
                    </div>
                </main>
            </div>

            <footer className="footer">
                <span>Add Panel</span>
                <div className="footer-image">[Image]</div>
            </footer>
        </div>
    );
};

export default MainPage;
