import React, {useState, useEffect, useRef} from 'react';
import { Box, Button, Typography } from '@mui/material';
import PropTypes from "prop-types";

const ImageClassifier = ({ selectedModel, isReadyToPredict }) => {
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
        return () => {
            stopWebcam();
        };
    }, []);

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
            streamRef.current = null;
            setIsWebcamActive(false);

            if (streaming) {
                stopStreaming();
            }
        }

        if (videoRef.current) {
            videoRef.current.srcObject = null;
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
            const response = await fetch(`${baseUrl}/api/v1/image-classification/predict`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            setPrediction(data.predicted_class)
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

    const handleFileChange = (event) => {
        setImage(event.target.files[0]);
    };

    const handlePredict = async () => {
        if (!image || !selectedModel) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('image', image);

        try {
            const response = await fetch(`${baseUrl}/api/v1/image-classification/predict`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            setPrediction(data.predicted_class);
        } catch (error) {
            console.error('Error predicting image:', error);
        }
        setLoading(false);
    };

    return (
        <Box sx={{maxWidth: 600, margin: 'auto'}}>
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
                    disabled={!streamRef.current || !selectedModel || streaming || !isReadyToPredict}
                >
                    Capture Image
                </Button>
                <Button
                    variant="contained"
                    onClick={toggleStreaming}
                    disabled={!streamRef.current || !selectedModel || !isReadyToPredict}
                >
                    {streaming ? 'Stop Streaming' : 'Start Streaming'}
                </Button>
            </Box>

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
                    disabled={!image || !selectedModel || !isReadyToPredict}
                >
                    Predict
                </Button>
            </Box>

            {prediction && (
                <Box sx={{ mt: 2 }}>
                    <Typography variant="h6">Prediction: {`${prediction}`}</Typography>
                </Box>
            )}

            {loading && (
                <Typography variant="body1">Loading...</Typography>
            )}
        </Box>
    );
};

ImageClassifier.propTypes = {
    selectedModel: PropTypes.string.isRequired,
    isReadyToPredict: PropTypes.bool.isRequired,
};

export default ImageClassifier;
