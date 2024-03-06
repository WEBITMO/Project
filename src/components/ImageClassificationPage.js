import React from 'react';
import {useParams} from 'react-router-dom';
import LogoLink from "./LogoLink";
import Toolbar from "@mui/material/Toolbar";
import AppBar from "@mui/material/AppBar";
import {Box} from "@mui/material";

const ImageClassificationPage = () => {
    const {orgId, modelId} = useParams();

    return (
        <Box sx={{display: 'flex', height: '100vh'}}>
            <AppBar position="fixed">
                <Toolbar>
                    <LogoLink/>
                </Toolbar>
            </AppBar>
            <h1>ImageClassification pipeline</h1>
            <p>Organization ID: {orgId}</p>
            <p>Model ID: {modelId}</p>
        </Box>
    );
};

export default ImageClassificationPage;