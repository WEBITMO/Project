import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import LogoLink from "./LogoLink";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import { Box, Container, Typography } from "@mui/material";
import MuiMarkdown from "mui-markdown";

const ImageClassificationPage = () => {
    const { orgId, modelId } = useParams();
    const [markdown, setMarkdown] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`http://localhost:8888/api/v1/model_card/${orgId}/${modelId}`);
                setMarkdown(response.data);
            } catch (error) {
                console.error('Error fetching markdown:', error);
            }
        };

        fetchData();
    }, [orgId, modelId]);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            <AppBar position="fixed">
                <Toolbar>
                    <LogoLink />
                </Toolbar>
            </AppBar>
            <Toolbar />
            <Container component="main" sx={{ mt: 8, mb: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Image Classification Pipeline
                </Typography>
                <Typography variant="body1">
                    Organization ID: {orgId}
                </Typography>
                <Typography variant="body1">
                    Model ID: {modelId}
                </Typography>
                <Box>
                    <MuiMarkdown>
                        {markdown}
                    </MuiMarkdown>
                </Box>
            </Container>
        </Box>
    );
};

export default ImageClassificationPage;
