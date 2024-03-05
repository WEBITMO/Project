import React, { useState, useEffect } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Tabs,
    Tab,
    Box,
    Grid,
    Menu,
    MenuItem,
    Pagination
} from '@mui/material';
import SortIcon from '@mui/icons-material/Sort';
import axios from 'axios';
import ModelCard from "./ModelCard";

const MainLayout = () => {
    // eslint-disable-next-line no-undef
    const baseUrl = process.env.REACT_APP_API_BASE_URL;
    const [pipelines, setPipelines] = useState([]);
    const [models, setModels] = useState([]);
    const [selectedPipelineId, setSelectedPipelineId] = useState(null);
    const [sortAnchorEl, setSortAnchorEl] = useState(null);
    const [sort, setSort] = useState('trending');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        console.log("Fetching pipelines...");
        fetchPipelines();
    }, []);

    useEffect(() => {
        if (selectedPipelineId) {
            fetchModels(selectedPipelineId, page);
        }
    }, [selectedPipelineId, sort, page]);

    const fetchPipelines = async () => {
        console.log("Executing fetchPipelines function...");
        const response = await axios.get(`${baseUrl}/api/v1/pipelines`);
        setPipelines(response.data);
    };

    const fetchModels = async (pipelineId, page = 1) => {
        console.log(`Executing fetchModels function for pipeline: ${pipelineId}, sort: ${sort}, page: ${page}`);
        const response = await axios.get(`${baseUrl}/api/v1/models?pipeline=${pipelineId}&sort=${sort}&p=${page}`);
        setModels(response.data.models);
        const numTotalItems = response.data.numTotalItems;
        const numItemsPerPage = response.data.numItemsPerPage;
        setTotalPages(Math.ceil(numTotalItems / numItemsPerPage));
    };

    const handlePipelineClick = async (pipelineId) => {
        setSelectedPipelineId(pipelineId);
    };

    const handleSortMenuClick = (event) => {
        setSortAnchorEl(event.currentTarget);
    };

    const handleSortMenuClose = (sortOption) => {
        setSortAnchorEl(null);
        if (sortOption && sortOption !== sort) {
            setSort(sortOption);
        }
    };

    const generateTabElements = () => {
        return pipelines.map((pipeline) => (
            <Tab label={pipeline.label} key={pipeline.id} onClick={() => handlePipelineClick(pipeline.id)}/>
        ));
    };

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    return (
        <Box sx={{display: 'flex', height: '100vh'}}>
            <AppBar position="fixed">
                <Toolbar>
                    <Typography variant="h6" noWrap component="div" sx={{flexGrow: 1}}>
                        Neural Networks HUB
                    </Typography>
                    <IconButton
                        size="large"
                        edge="end"
                        color="inherit"
                        aria-label="sort"
                        aria-controls="sort-menu"
                        aria-haspopup="true"
                        onClick={handleSortMenuClick}
                    >
                        <SortIcon/>
                    </IconButton>
                    <Menu
                        id="sort-menu"
                        anchorEl={sortAnchorEl}
                        open={Boolean(sortAnchorEl)}
                        onClose={() => handleSortMenuClose()}
                    >
                        <MenuItem onClick={() => handleSortMenuClose('trending')}>Trending</MenuItem>
                        <MenuItem onClick={() => handleSortMenuClose('likes')}>Most likes</MenuItem>
                        <MenuItem onClick={() => handleSortMenuClose('downloads')}>Most downloads</MenuItem>
                        <MenuItem onClick={() => handleSortMenuClose('created')}>Recently created</MenuItem>
                        <MenuItem onClick={() => handleSortMenuClose('updated')}>Recently updated</MenuItem>
                    </Menu>
                </Toolbar>
                <Tabs
                    value={false}
                    variant="scrollable"
                    scrollButtons="auto"
                    allowScrollButtonsMobile
                >
                    {generateTabElements()}
                </Tabs>
            </AppBar>
            <Box component="main" sx={{ flexGrow: 1, p: 3, paddingTop: '100px' }}>
                <Grid container spacing={2}>
                    {models.map((model) => (
                        <Grid item xs={12} sm={6} md={4} key={model.id}>
                            <ModelCard model={model} />
                        </Grid>
                    ))}
                </Grid>
                <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 4, backgroundColor: '#fff' }}>
                    <Pagination
                        count={totalPages}
                        page={page}
                        onChange={handlePageChange}
                        color={"standard"}
                        sx={{
                            '& .MuiPaginationItem-root': {
                                color: 'white',
                            },
                            '& .Mui-selected': {
                                backgroundColor: 'primary.main',
                                color: 'white',
                            },
                            '& .MuiPaginationItem-ellipsis': {
                                color: 'white',
                            },
                            '& .MuiPaginationItem-page': {
                                color: 'white',
                            },
                            // backgroundColor: '#fff',
                            // boxShadow: '0px 3px 6px rgba(0,0,0,0.1)',
                            borderRadius: '4px',
                            padding: '10px',
                        }}
                    />
                </Box>
            </Box>
        </Box>
    );
}

export default MainLayout;