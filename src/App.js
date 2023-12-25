import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Menu from './components/Menu';
import HomePage from './components/HomePage';
import AboutPage from './components/AboutPage';
import ContactPage from './components/ContactPage';
import Footer from './components/Footer'
import ChatPage from "./components/ChatPage";
function App() {
const LocationAwareFooter = () => {
    const location = useLocation();

    if (location.pathname === '/chat') {
        return null;
    }

    return <Footer />;
};

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
                  {/* Define other routes here */}
              </Routes>
          </div>
          <LocationAwareFooter />
      </div>
  </Router>
);
}

export default App;
