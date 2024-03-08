import React from 'react'
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import TestingPage from "./components/TestingPage";
import ModelViewPage from "./components/ModelViewPage";


function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<TestingPage/>}/>
                <Route path="/:pipelineTag/:orgId/:modelId" element={<ModelViewPage/>}/>
            </Routes>
        </Router>
    );
}

export default App;
