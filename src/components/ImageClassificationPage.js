import React, {useState, useEffect} from 'react';
import {useParams} from 'react-router-dom';
import axios from 'axios';
import LogoLink from "./LogoLink";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import {Box, Container, FormControl, InputLabel, LinearProgress, MenuItem, Select, Typography} from "@mui/material";
import MuiMarkdown from "mui-markdown";
import Button from "@mui/material/Button";

const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

const useModelData = (orgId, modelId, initialFetchIntervalInSeconds) => {
    // eslint-disable-next-line no-undef
    const baseUrl = process.env.REACT_APP_API_BASE_URL;

    const [markdown, setMarkdown] = useState('');
    const [modelSize, setModelSize] = useState(0);
    const [localModelSize, setLocalModelSize] = useState(0);
    const [fetchInterval, setFetchInterval] = useState(initialFetchIntervalInSeconds);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModelDownloaded, setIsModelDownloaded] = useState(false);

    const fetchMarkdown = async () => {
        try {
            const markdownResponse = await axios.get(`${baseUrl}/api/v1/model_card/${orgId}/${modelId}`);
            setMarkdown(markdownResponse.data);
        } catch (error) {
            console.error('Error fetching markdown:', error);
            setError('Error fetching markdown. Please try again later.');
        }
    };

    const fetchRemoteSize = async () => {
        try {
            const remoteSizeResponse = await axios.get(`${baseUrl}/api/v1/model_remote_size/${orgId}/${modelId}`);
            setModelSize(remoteSizeResponse.data);
        } catch (error) {
            console.error('Error fetching remote size:', error);
            setError('Error fetching remote size. Please try again later.');
        }
    };

    const fetchLocalModelSize = async () => {
        try {
            const localSizeResponse = await axios.get(`${baseUrl}/api/v1/model_local_size/${orgId}/${modelId}`);
            setLocalModelSize(localSizeResponse.data);
        } catch (error) {
            console.error('Error fetching local model size:', error);
            setError('Error fetching local model size. Please try again later.');
        }
    };

    const downloadModel = async () => {
        setIsLoading(true);
        setError('');
        try {
            await axios.get(`${baseUrl}/api/v1/model_download/${orgId}/${modelId}`);
            setIsModelDownloaded(true);
        } catch (error) {
            console.error('Error downloading model:', error);
            setError('Error downloading the model. Please try again later.');
        }
        setIsLoading(false);
    };

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            await fetchRemoteSize();
            await fetchLocalModelSize();
            await fetchMarkdown();
            setIsLoading(false);
        };
        fetchData();
    }, []);

    useEffect(() => {
        const intervalMilliseconds = fetchInterval * 1000;
        let intervalId;
        if (modelSize && localModelSize < modelSize) {
            intervalId = setInterval(fetchLocalModelSize, intervalMilliseconds);
        }
        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [modelSize, localModelSize, fetchInterval]);

    useEffect(() => {
        if (localModelSize && modelSize && localModelSize === modelSize) {
            setIsModelDownloaded(true);
        }
    }, [localModelSize, modelSize]);

    return {
        markdown,
        modelSize,
        localModelSize,
        isLoading,
        error,
        fetchInterval,
        setFetchInterval,
        isModelDownloaded,
        downloadModel
    };
};

const ImageClassificationPage = () => {
    const {orgId, modelId} = useParams();
    const {
        markdown, modelSize, localModelSize, isLoading, error, fetchInterval,
        setFetchInterval, isModelDownloaded, downloadModel
    } = useModelData(orgId, modelId, 5);

    const handleIntervalChange = (event) => {
        setFetchInterval(Number(event.target.value));
    };

    const progress = modelSize ? (localModelSize / modelSize) * 100 : 0;
    const isDownloading = isLoading && !isModelDownloaded;

    return (
        <Box sx={{display: 'flex', flexDirection: 'column', height: '100vh'}}>
            <AppBar position="fixed">
                <Toolbar>
                    <LogoLink/>
                </Toolbar>
            </AppBar>
            <Toolbar/>
            <Container component="main" sx={{mt: 8, mb: 4}}>
                <Typography variant="h4" gutterBottom>
                    Image Classification Pipeline
                </Typography>
                <Typography variant="body1">
                    Organization ID: {orgId}
                </Typography>
                <Typography variant="body1">
                    Model ID: {modelId}
                </Typography>

                {error && <Typography variant="body1" color="error">Failed to fetch data: {error}</Typography>}

                <Typography variant="body1">
                    Remote Size: {modelSize !== null ? formatBytes(modelSize) : 'Calculating...'}
                </Typography>
                <Typography variant="body1">
                    Local Size: {localModelSize !== null ? formatBytes(localModelSize) : 'Calculating...'}
                </Typography>

                <Button
                    variant="contained"
                    color={isModelDownloaded ? "success" : "primary"}
                    onClick={!isModelDownloaded ? downloadModel : undefined}
                    sx={{m: 2}}
                    disabled={isDownloading || isModelDownloaded}
                >
                    {isModelDownloaded ? "Model Downloaded" : isDownloading ? "Downloading..." : "Download Model"}
                </Button>

                {!isModelDownloaded && !isDownloading && (
                    <FormControl variant="outlined" sx={{m: 1, minWidth: 120}}>
                        <InputLabel>Fetch Interval</InputLabel>
                        <Select
                            value={fetchInterval}
                            onChange={handleIntervalChange}
                            label="Fetch Interval"
                        >
                            <MenuItem value={1}>1 second</MenuItem>
                            <MenuItem value={5}>5 seconds</MenuItem>
                            <MenuItem value={30}>30 seconds</MenuItem>
                            <MenuItem value={60}>1 minute</MenuItem>
                        </Select>
                    </FormControl>
                )}

                <LinearProgress variant="determinate" value={progress}/>
                <Typography variant="body2" sx={{mt: 1}}>
                    Download Progress: {progress.toFixed(2)}%
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
