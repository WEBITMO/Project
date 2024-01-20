import React, { useState, useEffect, useRef } from 'react';
import { Box, Button, CircularProgress, Typography, Select, MenuItem } from '@mui/material';

const ImageSegmentationPage = () => {
    const [models, setModels] = useState([]);
    const [selectedModel, setSelectedModel] = useState('');
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isWebcamActive, setIsWebcamActive] = useState(false);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    // eslint-disable-next-line no-undef
    const baseUrl = process.env.REACT_APP_API_BASE_URL;

    useEffect(() => {
        fetchModels();
        return () => {
            stopWebcam();
        };
    }, []);

    const fetchModels = async () => {
        try {
            const response = await fetch(`${baseUrl}/api/v1/image_segmentation_model/`);
            const data = await response.json();
            setModels(data);
        } catch (error) {
            console.error('Error fetching models:', error);
        }
    };

    const startWebcam = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            videoRef.current.srcObject = stream;
            streamRef.current = stream;
            setIsWebcamActive(true);
        } catch (error) {
            console.error('Error accessing webcam:', error);
        }
    };

    const stopWebcam = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
            setIsWebcamActive(false);
        }
    };

    const captureImage = () => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(blob => sendImage(blob));
    };

    const sendImage = async (imageBlob) => {
        if (!selectedModel) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('image', imageBlob);

        try {
            const response = await fetch(`${baseUrl}/api/v1/image_segmentation_model/predict`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            if (data.predictions) {
                drawPredictionsOnCanvas(data.predictions);
            }
        } catch (error) {
            console.error('Error predicting image:', error);
        } finally {
            setLoading(false);
        }
    };

    const drawPredictionsOnCanvas = (predictions) => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
        predictions.forEach(prediction => {
            const [x, y, width, height] = prediction.box;
            context.strokeStyle = getRandomColor();
            context.lineWidth = 2;
            context.strokeRect(x, y, width, height);
            context.fillStyle = context.strokeStyle;
            context.fillText(`${prediction.label}: ${prediction.score.toFixed(2)}`, x, y - 10);
        });
    };

    const getRandomColor = () => {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    };

    const handleModelSelect = async (event) => {
        const modelName = event.target.value;
        setLoading(true);
        setSelectedModel(modelName);
        try {
            await fetch(`${baseUrl}/api/v1/image_segmentation_model/load`, {
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
        const file = event.target.files[0];
        setImage(file);
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = canvasRef.current;
                canvas.width = img.width;
                canvas.height = img.height;
                canvas.getContext('2d').drawImage(img, 0, 0);
                sendImage(file);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    };

    return (
        <Box sx={{ maxWidth: 600, margin: 'auto' }}>
            <Typography variant="h4" sx={{ textAlign: 'center', mb: 2 }}>Image Segmentation</Typography>

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

            <video ref={videoRef} autoPlay style={{ width: '100%', display: isWebcamActive ? 'block' : 'none' }} />
            <canvas ref={canvasRef} style={{ width: '100%', display: isWebcamActive ? 'block' : 'none' }} />

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, my: 2 }}>
                <Button variant="contained" onClick={startWebcam} disabled={isWebcamActive}>Start Webcam</Button>
                <Button variant="contained" onClick={stopWebcam} disabled={!isWebcamActive}>Stop Webcam</Button>
                <Button variant="contained" onClick={captureImage} disabled={!isWebcamActive || !selectedModel}>Capture Image</Button>
            </Box>

            <Box sx={{ mt: 2 }}>
                <input
                    accept="image/*"
                    type="file"
                    onChange={handleFileChange}
                />
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => sendImage(image)}
                    disabled={!image || !selectedModel}
                >
                    Predict
                </Button>
            </Box>

            {loading && <CircularProgress />}
        </Box>
    );
};

export default ImageSegmentationPage;
