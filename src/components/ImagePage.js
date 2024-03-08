import React, {useState, useEffect, useRef} from 'react';
import { Box, Button, Typography, Select, MenuItem } from '@mui/material';

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
    const [isWebcamActive, setIsWebcamActive] = useState(false);

    useEffect(() => {
        fetchModels();
        return () => {
            stopWebcam();
        };
    }, []);

    const startWebcam = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            videoRef.current.srcObject = stream;
            streamRef.current = stream;
            setIsWebcamActive(true); // Set the webcam state to active
        } catch (error) {
            console.error('Error accessing webcam:', error);
        }
    };

    const stopWebcam = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
            streamRef.current = null;
            setIsWebcamActive(false);

            if (streaming) {
                stopStreaming();
            }
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
        if (streaming) {
            stopStreaming();
        } else if (streamRef.current && selectedModel) {
            startStreaming();
        }
        setStreaming(!streaming);
    };

    const startStreaming = () => {
        streamIntervalRef.current = setInterval(() => {
            if (videoRef.current) {
                captureImage();
            }
        }, 100);
    };

    const stopStreaming = () => {
        if (streamIntervalRef.current) {
            clearInterval(streamIntervalRef.current);
            streamIntervalRef.current = null;
        }
        setStreaming(false);
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

    const handleModelSelect = async (event) => {
        const modelName = event.target.value;
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
        <Box sx={{maxWidth: 600, margin: 'auto'}}>
            <Typography variant="h4" sx={{textAlign: 'center', mb: 2}}>Image Prediction</Typography>

            <Box sx={{ mt: 2, mb: 2 }}>
                {/*<Typography variant="h6">Choose Model:</Typography>*/}
                <Select
                    value={selectedModel}
                    onChange={handleModelSelect}
                    displayEmpty
                    fullWidth
                >
                    <MenuItem value="" disabled>Select a model</MenuItem>
                    {models.map((model, index) => (
                        <MenuItem key={index} value={model}>{model}</MenuItem>
                    ))}
                </Select>
            </Box>

            <video ref={videoRef} autoPlay style={{ width: '100%', display: isWebcamActive ? 'block' : 'none' }} />

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, my: 2 }}>
                {streamRef.current ? (
                    <Button variant="contained" onClick={stopWebcam}>Stop Webcam</Button>
                ) : (
                    <Button variant="contained" onClick={startWebcam}>Start Webcam</Button>
                )}
                <Button
                    variant="contained"
                    onClick={captureImage}
                    disabled={!streamRef.current || !selectedModel || streaming}
                >
                    Capture Image
                </Button>
                <Button
                    variant="contained"
                    onClick={toggleStreaming}
                    disabled={!streamRef.current || !selectedModel}
                >
                    {streaming ? 'Stop Streaming' : 'Start Streaming'}
                </Button>
            </Box>

            {/*<Typography variant="h6" sx={{mt: 2}}>Model: {selectedModel}</Typography>*/}

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
                    disabled={!image || !selectedModel}
                >
                    Predict
                </Button>
            </Box>

            {prediction && (
                <Box sx={{ mt: 2 }}>
                    <Typography variant="h6">Prediction: {`${prediction.predicted_class}`}</Typography>
                </Box>
            )}

            {loading}
        </Box>
    );
};

export default ImageClassificationPage;
