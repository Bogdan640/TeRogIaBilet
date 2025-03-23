import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import AdminPage from '../pages/AdminPage.jsx';
import concerts from '../In_memory_storage/Concerts.js';

// Mock the router navigation
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate
}));

// Mock current date for validation testing
const mockToday = new Date('2023-07-15');
const originalDate = global.Date;

describe('AdminPage Component', () => {
    let initialConcertsLength;

    beforeEach(() => {
        // Save initial concerts length
        initialConcertsLength = concerts.length;

        // Save initial concerts length
        initialConcertsLength = concerts.length;

        // Mock scrollIntoView
        window.HTMLElement.prototype.scrollIntoView = jest.fn();
        // Mock Date for validation
        global.Date = class extends Date {
            constructor(...args) {
                if (args.length === 0) {
                    super();
                    // After calling super(), we can set the time to match mockToday
                    this.setTime(mockToday.getTime());
                } else {
                    super(...args);
                }
            }

            static now() {
                return mockToday.getTime();
            }
        };

        // Render component
        render(
            <BrowserRouter>
                <AdminPage/>
            </BrowserRouter>
        );
    });

    afterEach(() => {
        // Restore original Date
        global.Date = originalDate;

        // Clean up added concerts
        while (concerts.length > initialConcertsLength) {
            concerts.pop();
        }
    });

    test('should add a new event successfully', async () => {
        // Fill the form
        fireEvent.change(screen.getByLabelText(/Event Name/i), {target: {value: 'New Test Concert'}});
        fireEvent.change(screen.getByLabelText(/Genre/i), {target: {value: 'Rock'}});
        fireEvent.change(screen.getByLabelText(/Price/i), {target: {value: '$75.00'}});
        fireEvent.change(screen.getByLabelText(/Location/i), {target: {value: 'Chicago'}});
        fireEvent.change(screen.getByLabelText(/Date/i), {target: {value: '2024-12-25'}});
        fireEvent.change(screen.getByLabelText(/Image URL/i), {target: {value: '/EventPageImages/test.jpg'}});

        // Submit the form
        fireEvent.click(screen.getByText(/Create Event/i));

        // Check success message
        await waitFor(() => {
            expect(screen.getByText(/Event "New Test Concert" has been added successfully!/i)).toBeInTheDocument();
        });

        // Verify concert was added
        expect(concerts.length).toBe(initialConcertsLength + 1);
        expect(concerts[concerts.length - 1].name).toBe('New Test Concert');
    });

    test('should update an existing event', async () => {
        // First create an event to update
        fireEvent.change(screen.getByLabelText(/Event Name/i), {target: {value: 'Event To Update'}});
        fireEvent.change(screen.getByLabelText(/Genre/i), {target: {value: 'Rock'}});
        fireEvent.change(screen.getByLabelText(/Price/i), {target: {value: '$50.00'}});
        fireEvent.change(screen.getByLabelText(/Location/i), {target: {value: 'New York'}});
        fireEvent.change(screen.getByLabelText(/Date/i), {target: {value: '2024-10-15'}});
        fireEvent.change(screen.getByLabelText(/Image URL/i), {target: {value: '/EventPageImages/test.jpg'}});
        fireEvent.click(screen.getByText(/Create Event/i));

        // Wait for the event to be created
        await waitFor(() => {
            expect(screen.getByText(/Event "Event To Update" has been added successfully!/i)).toBeInTheDocument();
        });

        // Select the event
        const eventElement = await screen.findByText('Event To Update');
        fireEvent.click(eventElement);

        // Click edit button
        fireEvent.click(screen.getByText(/Edit Selected/i));


        await waitFor(() => {
            expect(screen.getByTestId("update-event-button")).toBeInTheDocument();
        });

        // Update the event name
        const nameInput = screen.getByLabelText(/Event Name/i);
        fireEvent.change(nameInput, {target: {value: 'Updated Event Name'}});

        // Submit the form
        fireEvent.click(screen.getByTestId("update-event-button"));

        // Check success message
        await waitFor(() => {
            expect(screen.getByText(/Event "Updated Event Name" has been updated successfully!/i)).toBeInTheDocument();
        });

        // Verify event was updated
        const updatedEvent = concerts.find(c => c.name === 'Updated Event Name');
        expect(updatedEvent).toBeTruthy();
    });

    test('should delete an event', async () => {
        // First create an event to delete
        fireEvent.change(screen.getByLabelText(/Event Name/i), {target: {value: 'Event To Delete'}});
        fireEvent.change(screen.getByLabelText(/Genre/i), {target: {value: 'Metal'}});
        fireEvent.change(screen.getByLabelText(/Price/i), {target: {value: '$60.00'}});
        fireEvent.change(screen.getByLabelText(/Location/i), {target: {value: 'Boston'}});
        fireEvent.change(screen.getByLabelText(/Date/i), {target: {value: '2024-09-20'}});
        fireEvent.change(screen.getByLabelText(/Image URL/i), {target: {value: '/EventPageImages/test.jpg'}});
        fireEvent.click(screen.getByText(/Create Event/i));

        // Wait for the event to be created
        await waitFor(() => {
            expect(screen.getByText(/Event "Event To Delete" has been added successfully!/i)).toBeInTheDocument();
        });

        // Get the length after adding
        const lengthAfterAdding = concerts.length;

        // Select the event
        const eventElement = await screen.findByText('Event To Delete');
        fireEvent.click(eventElement);

        // Click remove button
        fireEvent.click(screen.getByText(/Remove Selected/i));

        // Check success message
        await waitFor(() => {
            expect(screen.getByText(/Event "Event To Delete" has been removed successfully!/i)).toBeInTheDocument();
        });

        // Verify event was deleted
        expect(concerts.length).toBe(lengthAfterAdding - 1);
        expect(concerts.find(c => c.name === 'Event To Delete')).toBeUndefined();
    });


});