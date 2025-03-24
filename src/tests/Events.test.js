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

    test("should toggle and use the items per page dropdown", async () => {
        render(
            <Router>
                <Events />
            </Router>
        );

        expect(screen.getByText("Items per page: 3 ▼")).toBeInTheDocument();
        expect(screen.queryByText("5")).not.toBeInTheDocument();

        fireEvent.click(screen.getByText("Items per page: 3 ▼"));
        expect(screen.getByText("5")).toBeInTheDocument();

        fireEvent.click(screen.getByText("5"));

        expect(screen.getByText("Items per page: 5 ▼")).toBeInTheDocument();
        expect(screen.queryByText("10")).not.toBeInTheDocument();

        fireEvent.click(screen.getByText("Items per page: 5 ▼"));
        expect(screen.getByText("10")).toBeInTheDocument();

        fireEvent.click(screen.getByText("Items per page: 5 ▼"));
        expect(screen.queryByText("10")).not.toBeInTheDocument();
    });


    test("should navigate through pagination", () => {
        render(
            <Router>
                <Events />
            </Router>
        );

        // Set items per page to the smallest available option
        fireEvent.click(screen.getByText("Items per page: 3 ▼"));
        fireEvent.click(screen.getByText("4"));

        // Since we have only 3 concerts and our items per page is now larger,
        // there should only be one page and the Next button should be disabled
        const nextButton = screen.getByText("Next");
        expect(nextButton).toBeDisabled();

        // Both Prev and Next buttons should work when appropriate
        const prevButton = screen.getByText("Prev");
        expect(prevButton).toBeDisabled(); // Disabled on first page
    });


    test("shows 'No events found' message when filters exclude all concerts", async () => {
        render(
            <Router>
                <Events />
            </Router>
        );

        // Search for a term that won't match any concerts
        const searchBox = screen.getByPlaceholderText("Search");
        fireEvent.change(searchBox, { target: { value: "NonexistentConcert" } });

        await waitFor(() => {
            expect(screen.getByText("No events found")).toBeInTheDocument();
            expect(screen.getByText("Try adjusting your filters")).toBeInTheDocument();
        });
    });

    test("disables city dropdown when no country is selected", () => {
        render(
            <Router>
                <Events />
            </Router>
        );

        // The third dropdown is the city dropdown (after order by and country)
        const cityDropdown = screen.getAllByRole("combobox")[2];
        expect(cityDropdown).toBeDisabled();
        const countryDropdown = screen.getAllByRole("combobox")[1];
        fireEvent.change(countryDropdown, { target: { value: "Country A" } });
        expect(cityDropdown).not.toBeDisabled();
    });

});