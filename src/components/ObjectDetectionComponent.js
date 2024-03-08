import React, { useState, useRef } from 'react';
import { Box, Button, CircularProgress } from '@mui/material';
import PropTypes from 'prop-types';

const ObjectDetectionComponent = ({ selectedModel, isReadyToPredict }) => {
    const [loading, setLoading] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [labelColors, setLabelColors] = useState({});
    const canvasRef = useRef(null);
    const imageRef = useRef(new Image());
    // eslint-disable-next-line no-undef
    const baseUrl = process.env.REACT_APP_API_BASE_URL;

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                imageRef.current.src = e.target.result;
                imageRef.current.onload = () => drawImage();
            };
            reader.readAsDataURL(file);
        } else {
            setImageFile(null);
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    };


    const drawImage = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        canvas.width = imageRef.current.width;
        canvas.height = imageRef.current.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(imageRef.current, 0, 0);
    };

    const getRandomColor = () => {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    };

    const drawPredictions = (predictions) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(imageRef.current, 0, 0, canvas.width, canvas.height);

        predictions.forEach(prediction => {
            const [x, y, width, height] = prediction.box;

            if (!labelColors[prediction.label]) {
                labelColors[prediction.label] = getRandomColor();
                setLabelColors({...labelColors});
            }

            ctx.strokeStyle = labelColors[prediction.label];
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, width, height);
            ctx.fillStyle = labelColors[prediction.label];
            ctx.fillText(`${prediction.label}: ${prediction.score.toFixed(2)}`, x, y - 10);
        });
    };


    const sendImage = async () => {
        if (!selectedModel || !isReadyToPredict || !imageFile) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('image', imageFile);

        try {
            const endpoint = `${baseUrl}/api/v1/object-detection/predict`;
            const response = await fetch(endpoint, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            drawPredictions(data.predictions);
        } catch (error) {
            console.error('Error predicting image:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ maxWidth: 600, margin: 'auto' }}>
            <Box sx={{ mt: 2 }}>
                <input
                    accept="image/*"
                    type="file"
                    onChange={handleFileChange}
                />
                <Button
                    variant="contained"
                    onClick={sendImage}
                    disabled={!imageFile || !selectedModel || !isReadyToPredict}
                >
                    Predict
                </Button>
            </Box>

            <canvas
                ref={canvasRef}
                style={{ maxWidth: '100%', border: '1px solid black' }}
            />

            {loading && <CircularProgress />}
        </Box>
    );
};

ObjectDetectionComponent.propTypes = {
    selectedModel: PropTypes.string.isRequired,
    isReadyToPredict: PropTypes.bool.isRequired,
};

export default ObjectDetectionComponent;
