import React, { useState, useEffect } from 'react';
import {Box, Button, CircularProgress, MenuItem, Select, Typography} from '@mui/material';

const SpeechToTextPage = () => {
    const [models, setModels] = useState([]);
    const [selectedModel, setSelectedModel] = useState('');
    const [audio, setAudio] = useState(null);
    const [loading, setLoading] = useState(false);
    const [prediction, setPrediction] = useState(null);
    // eslint-disable-next-line no-undef
    const baseUrl = process.env.REACT_APP_API_BASE_URL;

    useEffect(() => {
        fetchModels();
    }, []);

    const fetchModels = async () => {
        try {
            const response = await fetch(`${baseUrl}/api/v1/speech_to_text_model/`);
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
            await fetch(`${baseUrl}/api/v1/speech_to_text_model/load`, {
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
        setAudio(event.target.files[0]);
    };

    const handlePredict = async () => {
        if (!audio || !selectedModel) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('audio', audio);

        try {
            const response = await fetch(`${baseUrl}/api/v1/speech_to_text_model/predict`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            setPrediction(data);
        } catch (error) {
            console.error('Error predicting audio:', error);
        }
        setLoading(false);
    };

    return (
        <Box sx={{ maxWidth: 600, margin: 'auto' }}>
            <Typography variant="h4" sx={{ textAlign: 'center', mb: 2 }}>Голос в Текст</Typography>
            <Select
              value={selectedModel}
              onChange={handleModelSelect}
              displayEmpty
              fullWidth
              sx={{ mb: 2 }}
            >
                <MenuItem value="" disabled>Select a model</MenuItem>
                {models.map((model, index) => (
                  <MenuItem key={index} value={model}>{model}</MenuItem>
                ))}
            </Select>

            <Typography variant="h6" sx={{ mt: 2 }}>Модель: {selectedModel}</Typography>

            <Box sx={{ mt: 2 }}>
                <input
                    accept="audio/*"
                    type="file"
                    onChange={handleFileChange}
                />
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handlePredict}
                    disabled={!audio || loading}
                >
                    Predict
                </Button>
            </Box>

            {loading && <CircularProgress />}

            {prediction && (
                <Box sx={{ mt: 2 }}>
                    <Typography variant="h6">Prediction Results:</Typography>
                    <Typography>{prediction.transcribed_text}</Typography>
                </Box>
            )}
        </Box>
    );
};

export default SpeechToTextPage;
