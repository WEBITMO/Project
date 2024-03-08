import React, {useState, useEffect} from 'react';
import {useParams} from 'react-router-dom';
import axios from 'axios';
import LogoLink from "./LogoLink";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import {Box, Container, FormControl, InputLabel, LinearProgress, MenuItem, Select, Typography} from "@mui/material";
import MuiMarkdown from "mui-markdown";
import Button from "@mui/material/Button";
import ImageClassifier from './ImageClassifier';

const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

const useModelData = (pipelineTag, orgId, modelId, initialFetchIntervalInSeconds) => {
    // eslint-disable-next-line no-undef
    const baseUrl = process.env.REACT_APP_API_BASE_URL;

    const [markdown, setMarkdown] = useState('');
    const [modelSize, setModelSize] = useState(0);
    const [localModelSize, setLocalModelSize] = useState(0);
    const [fetchInterval, setFetchInterval] = useState(initialFetchIntervalInSeconds);
    const [downloadStatus, setDownloadStatus] = useState('idle'); // idle | downloading | completed | error
    const [modelLoadStatus, setModelLoadStatus] = useState('not_loaded'); // not_loaded | loaded

    const fetchMarkdown = async () => {
        try {
            const markdownResponse = await axios.get(`${baseUrl}/api/v1/model_card/${orgId}/${modelId}`);
            setMarkdown(markdownResponse.data);
        } catch (error) {
            console.error('Error fetching markdown:', error);
        }
    };

    const fetchRemoteSize = async () => {
        try {
            const remoteSizeResponse = await axios.get(`${baseUrl}/api/v1/model_remote_size/${orgId}/${modelId}`);
            setModelSize(remoteSizeResponse.data);
        } catch (error) {
            console.error('Error fetching remote size:', error);
        }
    };

    const fetchLocalModelSize = async () => {
        try {
            const localSizeResponse = await axios.get(`${baseUrl}/api/v1/model_local_size/${orgId}/${modelId}`);
            setLocalModelSize(localSizeResponse.data);
        } catch (error) {
            console.error('Error fetching local model size:', error);
        }
    };

    const fetchDownloadStatus = async () => {
        try {
            const response = await axios.get(`${baseUrl}/api/v1/model_download_status/${orgId}/${modelId}`);
            setDownloadStatus(response.data.status === 'in_progress' ? 'downloading' : 'idle');
        } catch (error) {
            console.error('Error fetching download status:', error);
        }
    };

    const fetchModelLoadStatus = async () => {
        try {
            const response = await axios.get(`${baseUrl}/api/v1/model_load_status/${orgId}/${modelId}`);
            setModelLoadStatus(response.data.status);
        } catch (error) {
            console.error('Error fetching model load status:', error);
        }
    };

    const loadModel = async () => {
        try {
            await axios.get(`${baseUrl}/api/v1/${pipelineTag}/load/${orgId}/${modelId}`);
            setModelLoadStatus('loaded');
        } catch (error) {
            console.error('Error loading model:', error);
        }
    };

    const unloadModel = async () => {
        try {
            await axios.get(`${baseUrl}/api/v1/${pipelineTag}/unload/${orgId}/${modelId}`);
            setModelLoadStatus('not_loaded');
        } catch (error) {
            console.error('Error unloading model:', error);
        }
    };

    const downloadModel = async () => {
        if (localModelSize === modelSize) return;
        setDownloadStatus('downloading');
        try {
            await axios.get(`${baseUrl}/api/v1/model_download/${orgId}/${modelId}`);
        } catch (error) {
            console.error('Error downloading model:', error);
            setDownloadStatus('error');
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            await fetchDownloadStatus();
            await fetchModelLoadStatus();
            await fetchRemoteSize();
            await fetchLocalModelSize();
            await fetchMarkdown();
        };
        fetchData();
    }, []);

    useEffect(() => {
        const intervalMilliseconds = fetchInterval * 1000;
        let intervalId;

        if (downloadStatus === 'downloading') {
            intervalId = setInterval(fetchLocalModelSize, intervalMilliseconds);
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [fetchInterval, downloadStatus]);

    useEffect(() => {
        if (modelSize && localModelSize === modelSize) {
            setDownloadStatus('completed');
        }
    }, [modelSize, localModelSize]);

    return {
        markdown,
        modelSize,
        localModelSize,
        downloadStatus,
        fetchInterval,
        setFetchInterval,
        downloadModel,
        modelLoadStatus,
        loadModel,
        unloadModel
    };
};

const ModelViewPage = () => {
    const {pipelineTag, orgId, modelId} = useParams();
    const {
        markdown,
        modelSize,
        localModelSize,
        downloadStatus,
        fetchInterval,
        setFetchInterval,
        downloadModel,
        modelLoadStatus,
        loadModel,
        unloadModel
    } = useModelData(pipelineTag, orgId, modelId, 1);

    const handleIntervalChange = (event) => {
        setFetchInterval(Number(event.target.value));
    };

    const handleLoadModel = () => {
        if (modelLoadStatus === 'not_loaded') {
            loadModel();
        } else {
            unloadModel();
        }
    };

    const progress = modelSize ? (localModelSize / modelSize) * 100 : 0;
    const buttonText = (() => {
        switch (downloadStatus) {
            case 'downloading': return 'Downloading...';
            case 'completed': return 'Model Downloaded';
            case 'error': return 'Download Failed - Retry?';
            default: return 'Download Model';
        }
    })();
    const isDownloadButtonDisabled = downloadStatus === 'downloading' || localModelSize === modelSize;
    const loadButtonLabel = modelLoadStatus === 'loaded' ? 'Unload Model' : 'Load Model';
    const isSelectDisabled = downloadStatus === 'completed';
    const isReadyToPredict = downloadStatus === 'completed' && modelLoadStatus === 'loaded';

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
                    {pipelineTag}
                </Typography>
                <Typography variant="body1">
                    Organization ID: {orgId}
                </Typography>
                <Typography variant="body1">
                    Model ID: {modelId}
                </Typography>

                <Typography variant="body1">
                    Remote Size: {modelSize !== null ? formatBytes(modelSize) : 'Calculating...'}
                </Typography>
                <Typography variant="body1">
                    Local Size: {localModelSize !== null ? formatBytes(localModelSize) : 'Calculating...'}
                </Typography>

                <Button
                    variant="contained"
                    color={downloadStatus === 'completed' ? "success" : downloadStatus === 'error' ? "error" : "primary"}
                    onClick={downloadModel}
                    disabled={isDownloadButtonDisabled}
                >
                    {buttonText}
                </Button>

                <FormControl variant="outlined" sx={{m: 1, minWidth: 120}} disabled={isSelectDisabled}>
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

                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleLoadModel}
                    disabled={downloadStatus !== 'completed'}
                >
                    {loadButtonLabel}
                </Button>

                <LinearProgress variant="determinate" value={progress}/>
                <Typography variant="body2" sx={{mt: 1}}>
                    Download Progress: {progress.toFixed(2)}%
                </Typography>

                <ImageClassifier selectedModel={modelId} isReadyToPredict={isReadyToPredict} />

                <Box>
                    <MuiMarkdown>
                        {markdown}
                    </MuiMarkdown>
                </Box>
            </Container>
        </Box>
    );
};

export default ModelViewPage;
