


import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Events from '../src/pages/Events.jsx'
import EventDetail from '../src/pages/EventDetail.jsx';
import './App.css';
import MainPage from '../src/pages/MainPage.jsx';
import SignIn from "./pages/SignIn.jsx";
import AdminPage from "./pages/AdminPage.jsx";


function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<MainPage />} />
                <Route path="/events" element={<Events />} />
                <Route path="/event/:eventSlug" element={<EventDetail />} />
                <Route path="/" element={<Navigate to="/events" replace />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/admin" element={<AdminPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;