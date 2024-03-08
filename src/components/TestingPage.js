import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import queryString from 'query-string';
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
    Pagination,
    InputBase
} from '@mui/material';
import SortIcon from '@mui/icons-material/Sort';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';
import ModelCard from "./ModelCard";
import LogoLink from "./LogoLink";

const MainLayout = () => {
    // eslint-disable-next-line no-undef
    const baseUrl = process.env.REACT_APP_API_BASE_URL;
    const navigate = useNavigate();
    const location = useLocation();

    const [parameters, setParameters] = useState({
        pipelineId: null,
        sort: 'trending',
        page: 1,
        searchQuery: ''
    });
    const [pipelines, setPipelines] = useState([]);
    const [models, setModels] = useState([]);
    const [totalPages, setTotalPages] = useState(0);
    const [numTotalItems, setNumTotalItems] = useState(0);
    const [sortAnchorEl, setSortAnchorEl] = useState(null);
    const [selectedPipelineId, setSelectedPipelineId] = useState(null);

    useEffect(() => {
        fetchPipelines();
    }, []);

    useEffect(() => {
        const params = queryString.parse(location.search);
        const updatedParameters = {
            pipelineId: params.pipeline || null,
            page: parseInt(params.page, 10) || 1,
            searchQuery: params.search || '',
            sort: params.sort || 'trending'
        };
        if (JSON.stringify(parameters) !== JSON.stringify(updatedParameters)) {
            setParameters(updatedParameters);
        }
    }, [location.search]);

    useEffect(() => {
        fetchModels();
    }, [location.search]);

    useEffect(() => {
        const query = queryString.stringify({
            page: parameters.page,
            search: encodeURIComponent(parameters.searchQuery),
            sort: parameters.sort,
            pipeline: parameters.pipelineId
        });
        const newSearch = `?${query}`;
        if (location.search !== newSearch) {
            navigate(newSearch);
        }
    }, [parameters]);

    const fetchPipelines = useCallback(async () => {
        const response = await axios.get(`${baseUrl}/api/v1/pipelines`);
        setPipelines(response.data);
    }, [baseUrl]);

    const fetchModels = useCallback(async () => {
        const { pipelineId, sort, page, searchQuery } = parameters;
        let url = `${baseUrl}/api/v1/models?sort=${sort}&p=${page}`;
        if (pipelineId) url += `&pipeline=${pipelineId}`;
        if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;

        const response = await axios.get(url);
        setModels(response.data.models);
        setNumTotalItems(response.data.numTotalItems);
        setTotalPages(Math.ceil(response.data.numTotalItems / response.data.numItemsPerPage));
    }, [parameters, baseUrl]);

    const handleSearchChange = (event) => {
        setParameters(prev => ({ ...prev, searchQuery: event.target.value }));
    };

    const handleSearchSubmit = (event) => {
        event.preventDefault();
        fetchModels();
    };

    const handlePipelineClick = (pipelineId) => {
        setSelectedPipelineId(pipelineId);
        setParameters(prev => ({ ...prev, pipelineId, page: 1 }));
    };

    const handleSortMenuClick = (event) => {
        setSortAnchorEl(event.currentTarget);
    };

    const handleSortMenuClose = (sortOption) => {
        setSortAnchorEl(null);
        if (sortOption) {
            setParameters(prev => ({ ...prev, sort: sortOption, page: 1, searchQuery: '' }));
        }
    };

    const handlePageChange = (event, value) => {
        setParameters(prev => ({ ...prev, page: value }));
    };

    const generateTabElements = () => {
        return pipelines.map((pipeline) => (
          <Tab
            label={pipeline.label}
            key={pipeline.id}
            value = {pipeline.id}
            onClick={() => handlePipelineClick(pipeline.id)}
          />
        ));
    };

    return (
      <Box sx={{ display: 'flex', height: '100vh' }}>
          <AppBar position="fixed">
              <Toolbar>
                  <LogoLink />
                  <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                      Models: {numTotalItems}
                  </Typography>
              </Toolbar>
          </AppBar>
          <Box component="main" sx={{ flexGrow: 1, p: 3, paddingTop: '100px' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Tabs
                    value={selectedPipelineId}
                    variant="scrollable"
                    scrollButtons="auto"
                    allowScrollButtonsMobile
                  >
                      {generateTabElements()}
                  </Tabs>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box component="form" onSubmit={handleSearchSubmit} sx={{ display: 'flex', alignItems: 'center', backgroundColor: 'white', borderRadius: 1, p: 0.5 }}>
                      <InputBase
                        placeholder="Filter by name…"
                        inputProps={{ 'aria-label': 'filter by name' }}
                        value={parameters.searchQuery}
                        onChange={handleSearchChange}
                        sx={{ color: 'black', ml: 1, flex: 1, boxShadow:2, px:2 }}
                      />
                      <IconButton type="submit" sx={{ p: '10px' }} aria-label="search">
                          <SearchIcon />
                      </IconButton>
                  </Box>
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
                  </Box>
              </Box>
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
              <Grid container spacing={2}>
                  {models.map((model) => (
                    <Grid item xs={12} sm={6} md={4} key={model.id}>
                        <ModelCard model={model} />
                    </Grid>
                  ))}
              </Grid>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <Pagination
                    count={totalPages}
                    page={parameters.page}
                    onChange={handlePageChange}
                    color="primary"
                    sx={{
                        '& .MuiPaginationItem-root': {
                            color: 'primary.main',
                        },
                        '& .Mui-selected': {
                            backgroundColor: 'primary.main',
                            color: 'white',
                        },
                        '& .MuiPaginationItem-ellipsis': {
                            color: 'primary.main',
                        },
                        '& .MuiPaginationItem-page': {
                            color: 'primary.main',
                        },
                        borderRadius: '4px',
                        padding: '10px',
                    }}
                  />
              </Box>
          </Box>
      </Box>
    );
};

export default MainLayout;
