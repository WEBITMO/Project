import React, {useState, useEffect, useRef} from 'react';
import {Box, Button, CircularProgress, List, ListItem, Typography} from '@mui/material';

const ImageClassificationPage = () => {
    const [models, setModels] = useState([]);
    const [selectedModel, setSelectedModel] = useState('');
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [prediction, setPrediction] = useState(null);
    // eslint-disable-next-line no-undef
    const baseUrl = process.env.REACT_APP_API_BASE_URL;
    const [streaming, setStreaming] = useState(false);
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const streamIntervalRef = useRef(null);

    useEffect(() => {
        fetchModels();
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const startWebcam = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({video: true});
            videoRef.current.srcObject = stream;
            streamRef.current = stream;
        } catch (error) {
            console.error('Error accessing webcam:', error);
        }
    };

    const captureImage = () => {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        canvas.getContext('2d').drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(blob => sendImage(blob));
    };

    const sendImage = async (imageBlob) => {
        if (!selectedModel) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('image', imageBlob);

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

    const toggleStreaming = () => {
        setStreaming(!streaming);
        if (!streaming) {
            startStreaming();
        } else {
            stopStreaming();
        }
    };

    const startStreaming = () => {
        streamIntervalRef.current = setInterval(() => {
            if (videoRef.current) {
                captureImage();
            }
        }, 1000); // 1 fps
    };

    const stopStreaming = () => {
        if (streamIntervalRef.current) {
            clearInterval(streamIntervalRef.current);
            streamIntervalRef.current = null;
        }
    };

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
                body: JSON.stringify({name: modelName}),
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
        <Box sx={{maxWidth: 600, margin: 'auto'}}>
            <Typography variant="h4" sx={{textAlign: 'center', mb: 2}}>Image Prediction</Typography>

            <video ref={videoRef} autoPlay style={{ width: '100%' }} />

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, my: 2 }}>
                <Button variant="contained" onClick={startWebcam}>Start Webcam</Button>
                <Button variant="contained" onClick={captureImage} disabled={!streamRef.current}>Capture Image</Button>
                <Button
                    variant="contained"
                    onClick={toggleStreaming}
                    disabled={!streamRef.current}
                >
                    {streaming ? 'Stop Streaming' : 'Start Streaming'}
                </Button>
            </Box>

            <List>
                {models.map((model, index) => (
                    <ListItem key={index} button onClick={() => handleModelSelect(model)}>
                        {model}
                    </ListItem>
                ))}
            </List>

            <Typography variant="h6" sx={{mt: 2}}>Model: {selectedModel}</Typography>

            <Box sx={{mt: 2}}>
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
                <Box sx={{mt: 2}}>
                    <Typography variant="h6">Prediction Results:</Typography>
                    <pre>{JSON.stringify(prediction, null, 2)}</pre>
                </Box>
            )}
        </Box>
    );
};

export default ImageClassificationPage;
