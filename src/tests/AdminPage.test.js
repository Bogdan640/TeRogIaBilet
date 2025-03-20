/* eslint-env jest */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminPage from '../pages/AdminPage.jsx';
import concerts from '../In_memory_storage/Concerts.js';


// Mock the react-router-dom useNavigate hook
jest.mock('react-router-dom', () => ({
    useNavigate: () => jest.fn(),
}));

// Create a backup of the concerts data to restore after tests
const originalConcerts = [...concerts];

describe('AdminPage Component', () => {
    // Reset concerts data and clear mocks before each test
    beforeEach(() => {
        concerts.length = 0;
        concerts.push(...originalConcerts);
    });

    test('renders AdminPage component without errors', () => {
        render(<AdminPage />);
        expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Create New Event')).toBeInTheDocument();
        expect(screen.getByText(`Current Events (${concerts.length})`)).toBeInTheDocument();
    });

    test('form validation shows error messages for invalid inputs', async () => {
        render(<AdminPage />);

        // Submit form without filling required fields
        const submitButton = screen.getByText('Create Event');
        fireEvent.click(submitButton);

        // Check that error messages are displayed
        await waitFor(() => {
            expect(screen.getByText('Event name is required')).toBeInTheDocument();
            expect(screen.getByText('Please select a genre')).toBeInTheDocument();
            expect(screen.getByText('Price must be in format $XX or $XX.XX')).toBeInTheDocument();
            expect(screen.getByText('Location is required')).toBeInTheDocument();
            expect(screen.getByText('Date is required')).toBeInTheDocument();
            expect(screen.getByText('Image URL is required')).toBeInTheDocument();
        });
    });

    test('can add a new event successfully', async () => {
        render(<AdminPage />);

        // Fill out the form
        fireEvent.change(screen.getByLabelText('Event Name'), { target: { value: 'Test Event' } });
        fireEvent.change(screen.getByLabelText('Genre'), { target: { value: 'Rock' } });
        fireEvent.change(screen.getByLabelText('Price'), { target: { value: '$25.00' } });
        fireEvent.change(screen.getByLabelText('Location'), { target: { value: 'Test Venue' } });

        // Set date to tomorrow to avoid past date validation error
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const formattedDate = tomorrow.toISOString().split('T')[0];
        fireEvent.change(screen.getByLabelText('Date'), { target: { value: formattedDate } });

        fireEvent.change(screen.getByLabelText('Image URL'), { target: { value: '/EventPageImages/test.jpg' } });

        // Submit the form
        const submitButton = screen.getByText('Create Event');
        fireEvent.click(submitButton);

        // Check that success message is displayed
        await waitFor(() => {
            expect(screen.getByText(/Test Event has been added successfully!/)).toBeInTheDocument();
        });

        // Check that the concerts array has been updated
        expect(concerts.find(concert => concert.name === 'Test Event')).toBeTruthy();
    });

    test('can select and edit an existing event', async () => {
        render(<AdminPage />);

        // Click on the first event to select it
        const firstEvent = screen.getAllByText(/Genre:/)[0].closest('.dashboard-event-item');
        fireEvent.click(firstEvent);

        // Click the edit button
        const editButton = screen.getByText('Edit Selected');
        fireEvent.click(editButton);

        // Verify that we're in edit mode
        expect(screen.getByText('Update Event')).toBeInTheDocument();

        // Update the event name
        fireEvent.change(screen.getByLabelText('Event Name'), { target: { value: 'Updated Event Name' } });

        // Submit the form
        const updateButton = screen.getByText('Update Event');
        fireEvent.click(updateButton);

        // Check that success message is displayed
        await waitFor(() => {
            expect(screen.getByText(/Updated Event Name has been updated successfully!/)).toBeInTheDocument();
        });

        // Check that the concert has been updated in the array
        expect(concerts.find(concert => concert.name === 'Updated Event Name')).toBeTruthy();
    });

    test('can select and remove an existing event', async () => {
        render(<AdminPage />);

        // Get the initial count of events
        const initialCount = concerts.length;

        // Click on the first event to select it
        const firstEvent = screen.getAllByText(/Genre:/)[0].closest('.dashboard-event-item');
        fireEvent.click(firstEvent);

        // Get the name of the first event for verification later
        const eventName = concerts[0].name;

        // Click the remove button
        const removeButton = screen.getByText('Remove Selected');
        fireEvent.click(removeButton);

        // Check that success message is displayed
        await waitFor(() => {
            expect(screen.getByText(new RegExp(`${eventName} has been removed successfully!`))).toBeInTheDocument();
        });

        // Check that the concert has been removed from the array
        expect(concerts.length).toBe(initialCount - 1);
        expect(concerts.find(concert => concert.name === eventName)).toBeFalsy();
    });

    test('cancel button resets the form during edit mode', async () => {
        render(<AdminPage />);

        // Click on the first event to select it
        const firstEvent = screen.getAllByText(/Genre:/)[0].closest('.dashboard-event-item');
        fireEvent.click(firstEvent);

        // Click the edit button
        const editButton = screen.getByText('Edit Selected');
        fireEvent.click(editButton);

        // Verify that we're in edit mode
        expect(screen.getByText('Update Event')).toBeInTheDocument();

        // Click cancel button
        const cancelButton = screen.getByText('Cancel');
        fireEvent.click(cancelButton);

        // Verify that we're back to create mode
        expect(screen.getByText('Create New Event')).toBeInTheDocument();

        // Verify that form has been reset
        expect(screen.getByLabelText('Event Name').value).toBe('');
    });
});