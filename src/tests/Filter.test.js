/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import '@testing-library/jest-dom';
import { BrowserRouter as Router } from "react-router-dom";
import Events from "../pages/Events.jsx";

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

describe("Events Filtering Tests", () => {
    test("filters concerts by genre", async () => {
        render(
            <Router>
                <Events />
            </Router>
        );

        // Find the Rock checkbox by looking for the label text and then clicking its associated input
        const rockLabel = screen.getByText("Rock");
        const rockCheckbox = rockLabel.previousSibling; // Get the checkbox before the label
        fireEvent.click(rockCheckbox);

        await waitFor(() => {
            expect(screen.getByText("Concert A")).toBeInTheDocument();
            expect(screen.queryByText("Concert B")).not.toBeInTheDocument();
            expect(screen.queryByText("Concert C")).not.toBeInTheDocument();
        });
    });

    test("filters concerts by country and city", async () => {
        render(
            <Router>
                <Events />
            </Router>
        );

        // Find the Country dropdown
        const countrySelect = screen.getAllByRole("combobox")[1]; // Country is the second dropdown
        fireEvent.change(countrySelect, { target: { value: "Country A" } });

        // Find the City dropdown
        const citySelect = screen.getAllByRole("combobox")[2]; // City is the third dropdown
        fireEvent.change(citySelect, { target: { value: "City A" } });

        await waitFor(() => {
            expect(screen.getByText("Concert A")).toBeInTheDocument();
            expect(screen.queryByText("Concert B")).not.toBeInTheDocument();
            expect(screen.queryByText("Concert C")).not.toBeInTheDocument();
        });
    });



    test("filters concerts by search query", async () => {
        render(
            <Router>
                <Events />
            </Router>
        );

        // Find the search box
        const searchBox = screen.getByPlaceholderText("Search");
        fireEvent.change(searchBox, { target: { value: "Concert A" } });

        await waitFor(() => {
            expect(screen.getByText("Concert A")).toBeInTheDocument();
            expect(screen.queryByText("Concert B")).not.toBeInTheDocument();
            expect(screen.queryByText("Concert C")).not.toBeInTheDocument();
        });
    });

    test("filters concerts by price range", async () => {
        render(
            <Router>
                <Events />
            </Router>
        );

        // Get the min price range input (first range input)
        const minPriceSlider = screen.getAllByRole("slider")[0];
        // Get the max price range input (second range input)
        const maxPriceSlider = screen.getAllByRole("slider")[1];

        // Set min price to $40 (excludes Concert B at $30)
        fireEvent.change(minPriceSlider, { target: { value: 40 } });

        // Set max price to $60 (excludes Concert A at $70)
        fireEvent.change(maxPriceSlider, { target: { value: 60 } });

        await waitFor(() => {
            // Only Concert C at $50 should be visible
            expect(screen.queryByText("Concert A")).not.toBeInTheDocument();
            expect(screen.queryByText("Concert B")).not.toBeInTheDocument();
            expect(screen.getByText("Concert C")).toBeInTheDocument();
        });
    });
});

describe("Events Sorting Tests", () => {
    test("sorts concerts by price", async () => {
        render(
            <Router>
                <Events />
            </Router>
        );

        // Find the Order By dropdown (first combobox in the page)
        const orderSelect = screen.getAllByRole("combobox")[0];
        fireEvent.change(orderSelect, { target: { value: "Price" } });

        await waitFor(() => {
            const concerts = screen.getAllByRole("heading", { level: 3 });
            expect(concerts[0]).toHaveTextContent("Concert B");
            expect(concerts[1]).toHaveTextContent("Concert C");
            expect(concerts[2]).toHaveTextContent("Concert A");
        });
    });

    test("sorts concerts by date", async () => {
        render(
            <Router>
                <Events />
            </Router>
        );

        const orderSelect = screen.getAllByRole("combobox")[0];
        fireEvent.change(orderSelect, { target: { value: "Date" } });

        await waitFor(() => {
            const concerts = screen.getAllByRole("heading", { level: 3 });
            expect(concerts[0]).toHaveTextContent("Concert A");
            expect(concerts[1]).toHaveTextContent("Concert B");
            expect(concerts[2]).toHaveTextContent("Concert C");
        });
    });

    test("sorts concerts by location", async () => {
        render(
            <Router>
                <Events />
            </Router>
        );

        const orderSelect = screen.getAllByRole("combobox")[0];
        fireEvent.change(orderSelect, { target: { value: "Location" } });

        await waitFor(() => {
            const concerts = screen.getAllByRole("heading", { level: 3 });
            expect(concerts[0]).toHaveTextContent("Concert A");
            expect(concerts[1]).toHaveTextContent("Concert B");
            expect(concerts[2]).toHaveTextContent("Concert C");
        });
    });
});