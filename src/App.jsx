


import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Events from '../src/pages/Events.jsx'
import EventDetail from '../src/pages/EventDetail.jsx';
import './App.css';
import MainPage from 'D:\\School\\2ndY_S2\\MPP\\battlepass\\src\\pages\\MainPage.jsx';


function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<MainPage />} />
                <Route path="/events" element={<Events />} />
                <Route path="/event/:eventSlug" element={<EventDetail />} />
                <Route path="/" element={<Navigate to="/events" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;