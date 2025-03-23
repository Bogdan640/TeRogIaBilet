/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import '@testing-library/jest-dom';
import { BrowserRouter as Router } from "react-router-dom";
import Events from "../pages/Events.jsx";

// Mock the entire react-router-dom module
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate
}));

jest.mock('../In_memory_storage/Concerts.js', () => [
    { id: 1, name: "Concert A", genre: "Rock", price: "$70", location: "City A", date: "2025-04-20", imageUrl: "/test1.jpg" },
    { id: 2, name: "Concert B", genre: "Punk", price: "$30", location: "City B", date: "2025-05-20", imageUrl: "/test2.jpg" },
    { id: 3, name: "Concert C", genre: "Metal", price: "$50", location: "City C", date: "2025-06-20", imageUrl: "/test3.jpg" }
]);

jest.mock('../In_memory_storage/Filters.js', () => ({
    genresList: ["Rock", "Jazz", "Pop"],
    orderByOptions: ["Price", "Date", "Location"],
    countries: ["Country A", "Country B"],
    cities: {
        "Country A": ["City A", "City B"],
        "Country B": ["City C"]
    }
}));

describe("Events Component Tests", () => {
    // Clear mock calls before each test
    beforeEach(() => {
        mockNavigate.mockClear();
    });

    test("should display all concerts from data source", () => {
        render(
            <Router>
                <Events />
            </Router>
        );

        expect(screen.getByText("Concert A")).toBeInTheDocument();
        expect(screen.getByText("Concert B")).toBeInTheDocument();
        expect(screen.getByText("Concert C")).toBeInTheDocument();
    });

    test("should navigate to event details when clicking 'See more info'", async () => {
        render(
            <Router>
                <Events />
            </Router>
        );

        // Find Concert A's card and click its "See more info" button
        const concertACard = screen.getByText("Concert A").closest(".event-card");
        const seeMoreButton = within(concertACard).getByText("See more info");
        fireEvent.click(seeMoreButton);

        // Verify navigation was called with expected path
        expect(mockNavigate).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith(
            "/event/concert-a",
            expect.objectContaining({
                state: expect.objectContaining({
                    concert: expect.objectContaining({ name: "Concert A" })
                })
            })
        );
    });

});