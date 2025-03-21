// /**
//  * @jest-environment jsdom
//  */
//
// // First, set up the polyfills before any imports
// import { TextEncoder, TextDecoder } from 'util';
// global.TextEncoder = TextEncoder;
// global.TextDecoder = TextDecoder;
//
// // Now import React and testing libraries
// import React from "react";
// import { render, screen, fireEvent, waitFor } from "@testing-library/react";
// import '@testing-library/jest-dom';
//
// // Mock the react-router-dom before importing AdminPage
// jest.mock('react-router-dom', () => ({
//     useNavigate: () => jest.fn(),
//     BrowserRouter: ({ children }) => <div>{children}</div>
// }));
//
// // Mock the concerts data
// jest.mock('../In_memory_storage/Concerts.js', () => [
//     {
//         id: 1,
//         name: "Existing Concert",
//         genre: "Rock",
//         price: "$50",
//         location: "Test Venue",
//         date: "2025-04-20",
//         imageUrl: "/test.jpg"
//     }
// ]);
//
// // Now import the component being tested
// import AdminPage from "../pages/AdminPage.jsx";
//
// // Mock local storage
// const mockLocalStorage = (() => {
//     let store = {};
//     return {
//         getItem: jest.fn((key) => store[key] || null),
//         setItem: jest.fn((key, value) => (store[key] = value.toString())),
//         clear: jest.fn(() => (store = {})),
//     };
// })();
// Object.defineProperty(window, "localStorage", { value: mockLocalStorage });
//
// // Mock scrollIntoView
// Element.prototype.scrollIntoView = jest.fn();
//
// describe("AdminPage Component", () => {
//     beforeEach(() => {
//         render(<AdminPage />);
//         mockLocalStorage.clear();
//     });
//
//     test("renders the admin page with correct initial elements", () => {
//         expect(screen.getByText("Admin Dashboard")).toBeInTheDocument();
//         expect(screen.getByText("Create New Event")).toBeInTheDocument();
//         expect(screen.getByText("Logout")).toBeInTheDocument();
//     });
//
//     test("validates form inputs before adding an event", async () => {
//         // Submit the form without filling any fields
//         fireEvent.click(screen.getByText("Create Event"));
//
//         // Check for validation errors
//         await waitFor(() => {
//             expect(screen.getByText("Event name is required")).toBeInTheDocument();
//             expect(screen.getByText("Please select a genre")).toBeInTheDocument();
//             expect(screen.getByText("Price must be in format $XX or $XX.XX")).toBeInTheDocument();
//         });
//     });
//
//     test("adds a new event correctly", async () => {
//         // Fill form fields
//         fireEvent.change(screen.getByLabelText("Event Name"), {
//             target: { value: "Rock Fest" },
//         });
//
//         // Select genre
//         const genreSelect = screen.getByLabelText("Genre");
//         fireEvent.change(genreSelect, { target: { value: "Rock" } });
//
//         // Fill other required fields
//         fireEvent.change(screen.getByLabelText("Price"), {
//             target: { value: "$50" },
//         });
//         fireEvent.change(screen.getByLabelText("Location"), {
//             target: { value: "Test Venue" },
//         });
//
//         // Set future date
//         const futureDate = new Date();
//         futureDate.setDate(futureDate.getDate() + 10);
//         const formattedDate = futureDate.toISOString().split('T')[0];
//         fireEvent.change(screen.getByLabelText("Date"), {
//             target: { value: formattedDate },
//         });
//
//         // Add image URL
//         fireEvent.change(screen.getByLabelText("Image URL"), {
//             target: { value: "/test-image.jpg" },
//         });
//
//         // Submit form
//         fireEvent.click(screen.getByText("Create Event"));
//
//         // Check for success message
//         await waitFor(() => {
//             expect(screen.getByText('Event "Rock Fest" has been added successfully!')).toBeInTheDocument();
//         });
//     });
//
//     test("edits an existing event correctly", async () => {
//         // Select the existing event
//         fireEvent.click(screen.getByText("Existing Concert"));
//
//         // Click edit button
//         fireEvent.click(screen.getByText("Edit Selected"));
//
//         // Verify form is populated and in edit mode
//         expect(screen.getByDisplayValue("Existing Concert")).toBeInTheDocument();
//
//         // Corrected assertion:
//         const updateEventElements = screen.getAllByText("Update Event");
//         expect(updateEventElements.length).toBeGreaterThan(0);
//         updateEventElements.forEach(element => {
//             expect(element).toBeInTheDocument();
//         });
//
//         // Change the name
//         fireEvent.change(screen.getByLabelText("Event Name"), {
//             target: { value: "Updated Concert" },
//         });
//
//         // Submit form
//         // If you want to click the button within the form, use getByRole, or getByTestId.
//         fireEvent.click(screen.getByRole('button', {name: /update event/i}));
//
//         // Check for success message
//         await waitFor(() => {
//             expect(screen.getByText('Event "Updated Concert" has been updated successfully!')).toBeInTheDocument();
//         });
//     });
//
//     test("removes an event correctly", async () => {
//         // Import the concerts array to check its length.
//         const concerts = require('../In_memory_storage/Concerts.js').default;
//
//         // Select the existing event
//         fireEvent.click(screen.getByText("Existing Concert"));
//
//         // Click remove button
//         fireEvent.click(screen.getByText("Remove Selected"));
//
//         // Check that the event was removed from the concerts array.
//         await waitFor(() => {
//             expect(concerts.length).toBe(0); // Assuming that the initial concerts array had 1 element.
//         });
//     });
// });