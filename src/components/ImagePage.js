import React, { useState, useEffect } from 'react';
import { Box, Button, CircularProgress, List, ListItem, Typography } from '@mui/material';

const ImageClassificationPage = () => {
    const [models, setModels] = useState([]);
    const [selectedModel, setSelectedModel] = useState('');
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [prediction, setPrediction] = useState(null);
    // eslint-disable-next-line no-undef
    const baseUrl = process.env.REACT_APP_API_BASE_URL;

    useEffect(() => {
        fetchModels();
    }, []);

    const fetchModels = async () => {
        try {
            const response = await fetch(`${baseUrl}/api/v1/image_classification_model/`);
            const data = await response.json();
            setModels(data);
        } catch (error) {
            console.error('Error fetching models:', error);
        }
    };

    const handleModelSelect = async (modelName) => {
        setLoading(true);
        setSelectedModel(modelName);
        try {
            await fetch(`${baseUrl}/api/v1/image_classification_model/load`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: modelName }),
            });
        } catch (error) {
            console.error('Error loading model:', error);
        }
        setLoading(false);
    };

    const handleFileChange = (event) => {
        setImage(event.target.files[0]);
    };

    const handlePredict = async () => {
        if (!image || !selectedModel) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('image', image);

        try {
            const response = await fetch(`${baseUrl}/api/v1/image_classification_model/predict`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            setPrediction(data);
        } catch (error) {
            console.error('Error predicting image:', error);
        }
        setLoading(false);
    };

    return (
        <Box sx={{ maxWidth: 600, margin: 'auto' }}>
            <Typography variant="h4" sx={{ textAlign: 'center', mb: 2 }}>Предсказание по изорбражению</Typography>

            <List>
                {models.map((model, index) => (
                    <ListItem key={index} button onClick={() => handleModelSelect(model)}>
                        {model}
                    </ListItem>
                ))}
            </List>

            <Typography variant="h6" sx={{ mt: 2 }}>Модель: {selectedModel}</Typography>

            <Box sx={{ mt: 2 }}>
                <input
                    accept="image/*"
                    type="file"
                    onChange={handleFileChange}
                />
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handlePredict}
                    disabled={!image || loading}
                >
                    Predict
                </Button>
            </Box>

            {loading && <CircularProgress />}

            {prediction && (
                <Box sx={{ mt: 2 }}>
                    <Typography variant="h6">Prediction Results:</Typography>
                    <pre>{JSON.stringify(prediction, null, 2)}</pre>
                </Box>
            )}
        </Box>
    );
};

export default ImageClassificationPage;
