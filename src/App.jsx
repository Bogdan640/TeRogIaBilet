
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from 'D:\\School\\2ndY_S2\\MPP\\battlepass\\src\\pages\\MainPage.jsx';
import Events from '../src/pages/Events.jsx'

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<MainPage />} />
                <Route path="/events" element={<Events />} />
            </Routes>
        </Router>
    );
}
//mor de nervi ma duc sa mi iau tigari

export default App;