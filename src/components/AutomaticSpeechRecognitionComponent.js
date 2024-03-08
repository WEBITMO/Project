import React, { useState } from 'react';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import PropTypes from 'prop-types';

const AutomaticSpeechRecognitionComponent = ({ selectedModel, isReadyToPredict }) => {
    const [audio, setAudio] = useState(null);
    const [loading, setLoading] = useState(false);
    const [prediction, setPrediction] = useState(null);
    // eslint-disable-next-line no-undef
    const baseUrl = process.env.REACT_APP_API_BASE_URL;

    const handleFileChange = (event) => {
        setAudio(event.target.files[0]);
    };

    const handlePredict = async () => {
        if (!audio || !selectedModel || !isReadyToPredict) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('audio', audio);

        try {
            const response = await fetch(`${baseUrl}/api/v1/automatic-speech-recognition/predict`, {
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
            <Typography variant="h4" sx={{ textAlign: 'center', mb: 2 }}>Voice to Text</Typography>

            <Typography variant="h6" sx={{ mt: 2 }}>Model: {selectedModel}</Typography>

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
                    disabled={!audio || !selectedModel || !isReadyToPredict}
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

AutomaticSpeechRecognitionComponent.propTypes = {
    selectedModel: PropTypes.string.isRequired,
    isReadyToPredict: PropTypes.bool.isRequired,
};

export default AutomaticSpeechRecognitionComponent;
