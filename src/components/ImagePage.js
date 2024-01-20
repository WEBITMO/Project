import React, { useState, useEffect } from 'react';
import { Box, Button, CircularProgress, Typography, Select, MenuItem, FormControl, InputLabel } from '@mui/material';

const ImageClassificationPage = () => {
    const [models, setModels] = useState([]);
    const [selectedModel, setSelectedModel] = useState('');
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [prediction, setPrediction] = useState(null);
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

    const handleModelChange = (event) => {
        setSelectedModel(event.target.value);
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
        } finally {
            setLoading(false);
        }
    };

    return (
      <Box sx={{ maxWidth: 600, margin: 'auto' }}>
          <Typography variant="h4" sx={{ textAlign: 'center', mb: 2 }}>Image Classification</Typography>

          <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="model-select-label">Select a Model</InputLabel>
              <Select
                labelId="model-select-label"
                value={selectedModel}
                label="Select a Model"
                onChange={handleModelChange}
              >
                  {models.map((model, index) => (
                    <MenuItem key={index} value={model}>{model}</MenuItem>
                  ))}
              </Select>
          </FormControl>

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
                disabled={!image || !selectedModel || loading}
              >
                  Predict
              </Button>
          </Box>

          {loading && <CircularProgress />}

          {prediction && (
            <Box sx={{ mt: 2 }}>
                <Typography variant="h6">Prediction Results:</Typography>
                <Typography>{prediction.prediction}</Typography>
            </Box>
          )}
      </Box>
    );
};

export default ImageClassificationPage;
