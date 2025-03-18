// src/App.jsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from 'D:\\School\\2ndY_S2\\MPP\\battlepass\\src\\pages\\MainPage.jsx';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<MainPage />} />
            </Routes>
        </Router>
    );
}

export default App;