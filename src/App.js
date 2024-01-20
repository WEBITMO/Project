import React from 'react'
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Menu from './components/Menu';
import HomePage from './components/HomePage';
import AboutPage from './components/AboutPage';
import ContactPage from './components/ContactPage';
import ChatPage from "./components/ChatPage";
import AudioPage from "./components/AudioPage";
import ImagePage from "./components/ImagePage";
import LocationAwareFooter from "./components/LocationAwareFooter";
import ImageSegmentationPage from "./components/ImageSegmentationPage";
import Analytics from './components/Analytics';
function App() {
return (
  <Router>
      <div id="root">
          <Menu />
          <div className="content">
              <Analytics/>
              <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/chat" element={<ChatPage />} />
                  <Route path="/audio" element={<AudioPage/>}/>
                  <Route path="/image" element={<ImagePage/>}/>
                  <Route path="/image_segmentation" element={<ImageSegmentationPage/>}/>
                  {/* Define other routes here */}
              </Routes>
          </div>
          <LocationAwareFooter />
      </div>
  </Router>
);
}

export default App;
