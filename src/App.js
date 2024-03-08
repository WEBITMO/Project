import React from 'react'
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import TestingPage from "./components/TestingPage";
import ModelViewPage from "./components/ModelViewPage";
import TextGenerationPage from "./components/TextGenerationPage";


function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<TestingPage/>}/>
                <Route path="/:pipelineTag/:orgId/:modelId" element={<ModelViewPage/>}/>
                <Route path="/text-generation/:modelId" element={<TextGenerationPage />} />
            </Routes>
        </Router>
    );
}

export default App;
