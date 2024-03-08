import React from 'react'
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import MainLayout from "./components/MainLayoutPage";
import ModelViewPage from "./components/ModelViewPage";


function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<MainLayout/>}/>
                <Route path="/:pipelineTag/:orgId/:modelId" element={<ModelViewPage/>}/>
            </Routes>
        </Router>
    );
}

export default App;
