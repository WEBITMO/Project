import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Menu from './components/Menu';
import HomePage from './components/HomePage';
import AboutPage from './components/AboutPage';
import ContactPage from './components/ContactPage';
import Footer from './components/Footer'
import ChatPage from "./components/ChatPage";
import ImageClassificationPage from "./components/ImagePage";
import SpeechToTextPage from "./components/AudioPage";
const LocationAwareFooter = () => {
    const location = useLocation();

    if (location.pathname === '/chat') {
        return null;
    }

    return <Footer />;
};

function App() {
    return (
        <Router>
            <div id="root">
                <Menu />
                <div className="content">
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/about" element={<AboutPage />} />
                        <Route path="/contact" element={<ContactPage />} />
                        <Route path="/chat" element={<ChatPage />} />
                        <Route path="/image" element={<ImageClassificationPage />} />
                        <Route path="/audio" element={<SpeechToTextPage />} />
                        {/* Определите другие маршруты здесь */}
                    </Routes>
                </div>
                <LocationAwareFooter />
            </div>
        </Router>
    );
}

export default App;
