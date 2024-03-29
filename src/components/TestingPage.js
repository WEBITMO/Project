import React, {useState, useEffect, useMemo, useCallback} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
import SearchIcon from '@mui/icons-material/Search';
import InputBase from '@mui/material/InputBase';
import axios from 'axios';
import ModelCard from "./ModelCard";
import LogoLink from "./LogoLink";
import { debounce } from 'lodash';
import { darken } from '@mui/system';
const useUrlParams = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const processUrlParams = (search) => {
        const urlParams = new URLSearchParams(search);
        let paramsFromUrl = Object.fromEntries(urlParams.entries());

        return {
            pipelineId: paramsFromUrl.pipelineId || 'all',
            sort: paramsFromUrl.sort || 'trending',
            page: parseInt(paramsFromUrl.page, 10) || 1,
            searchQuery: paramsFromUrl.searchQuery || ''
        };
    };

    const [params, setParams] = useState(() => processUrlParams(location.search));

    useEffect(() => {
        setParams(processUrlParams(location.search));
    }, [location.search]);

    const updateParams = (newParams) => {
        const updatedParams = { ...params, ...newParams };
        setParams(updatedParams);
        const searchParams = new URLSearchParams(updatedParams).toString();
        navigate(`?${searchParams}`);
    };

    return [params, updateParams];
};

const MainLayout = () => {
    // eslint-disable-next-line no-undef
    const baseUrl = process.env.REACT_APP_API_BASE_URL;


    const [pipelines, setPipelines] = useState([]);
    const [models, setModels] = useState([]);
    const [totalPages, setTotalPages] = useState(0);
    const [numTotalItems, setNumTotalItems] = useState(0);
    const [sortAnchorEl, setSortAnchorEl] = useState(null);
    const [selectedPipelineId, setSelectedPipelineId] = useState(null);

    const [parameters, setParameters] = useUrlParams({
        pipelineId: 'all',
        sort: 'trending',
        page: 1,
        searchQuery: ''
    });

    const [inputValue, setInputValue] = useState(parameters.searchQuery);
    const showSortMenu = selectedPipelineId !== 'text-generation';
    useEffect(() => {
        fetchPipelines();
    }, []);

    useEffect(() => {
        fetchModels();
    }, [parameters.pipelineId, parameters.sort, parameters.page, parameters.searchQuery]);

    const fetchPipelines = async () => {
        const response = await axios.get(`${baseUrl}/api/v1/pipelines`);
        setPipelines(response.data);
    };

    const fetchModels = async () => {
        const { pipelineId, sort, page, searchQuery } = parameters;
        let url = `${baseUrl}/api/v1/models?sort=${sort}&p=${page}`;
        if (pipelineId) url += `&pipeline=${pipelineId}`;
        if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;

        const response = await axios.get(url);
        setModels(response.data.models);
        setNumTotalItems(response.data.numTotalItems);
        setTotalPages(Math.ceil(response.data.numTotalItems / response.data.numItemsPerPage));
    };

    const debouncedSetSearchQuery = useCallback(
        debounce((newQuery) => {
            setParameters({ searchQuery: newQuery, page: 1 });
        }, 300),
        []
    );

    useEffect(() => {
        setInputValue(parameters.searchQuery);
    }, [parameters.searchQuery]);

    const handleSearchChange = (event) => {
        setInputValue(event.target.value);
        debouncedSetSearchQuery(event.target.value);
    };

    const handleSearchSubmit = (event) => {
        event.preventDefault();
        setParameters({ searchQuery: parameters.searchQuery, page: 1 });
    };

    const handlePipelineClick = (pipelineId) => {
        setParameters({ pipelineId: pipelineId, page: 1 });
        setSelectedPipelineId(pipelineId)
    };

    const handleSortMenuClick = (event) => {
        setSortAnchorEl(event.currentTarget);
    };

    const handleSortMenuClose = (sortOption) => {
        setSortAnchorEl(null);
        if (sortOption) {
            setParameters({ sort: sortOption, page: 1 });
        }
    };

    const handlePageChange = (event, value) => {
        setParameters({ page: value });
    };

    const generateTabElements = useMemo(() => {
        return pipelines.map((pipeline) => (
            <Tab label={pipeline.label} key={pipeline.id} value={pipeline.id} sx={{ color: 'white' }} onClick={() => handlePipelineClick(pipeline.id)} />
        ));
    }, [pipelines]);

    const handleLogoClick = () => {
        setSelectedPipelineId(null);
    };

    return (
      <Box data-testid="main-layout" sx={{ display: 'flex', height: '100vh' }}>
              <AppBar data-testid="AppBar" position="fixed">
                  <Toolbar>
                      <Box sx={{ boxShadow: '5',borderRadius:2, width: 'fit-content',padding: '8px' }}>
                          <LogoLink onClick={handleLogoClick} />
                      </Box>
                      <Box sx={{ marginLeft: '20px', marginRight:'600px' }}>
                          <Typography variant="h6" noWrap component="div">
                              Models: {numTotalItems}
                          </Typography>
                      </Box>
                      <Tabs
                        data-testid="tabs"
                        value={selectedPipelineId || false}
                        variant="scrollable"
                        scrollButtons="auto"
                        allowScrollButtonsMobile
                        sx={{
                            borderRadius:2,
                            boxShadow:5,
                            '& .Mui-selected': {
                                backgroundColor: darken("#2b82d9", 0.4),
                                color: 'white',
                            },
                        }}
                      >
                          {generateTabElements}
                      </Tabs>
                      <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto',paddingLeft: '20px' }}>
                          <Box component="form" data-testid="search-form" onSubmit={handleSearchSubmit} sx={{ display: 'flex', alignItems: 'center', backgroundColor: 'white', borderRadius: 1, p: 0.5 }}>
                              <InputBase
                                data-testid="search-input"
                                placeholder="Filter by name…"
                                inputProps={{ 'aria-label': 'filter by name' }}
                                value={inputValue}
                                onChange={handleSearchChange}
                                sx={{ color: 'black', ml: 1, flex: 1 }}
                              />
                              <IconButton type="submit" sx={{ p: '10px' }} aria-label="search">
                                  <SearchIcon />
                              </IconButton>
                          </Box>
                          {showSortMenu &&(
                          <IconButton
                            data-testid="sort-button"
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
                            )}
                      </Box>
                      {showSortMenu &&(
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
                      )}
                  </Toolbar>
              </AppBar>
          <Box component="main" sx={{ flexGrow: 1, p: 3, paddingTop: '120px' }}>
              <Grid container spacing={2}>
                  {models.map((model) => (
                    <Grid item xs={12} sm={6} md={4} key={model.id} data-testid="model-card">
                        <ModelCard model={model} />
                    </Grid>
                  ))}
              </Grid>
              {models.length > 0 && (
                <Box data-testid="pagination" sx={{ display: 'flex', justifyContent: 'center', marginTop: 4, backgroundColor: 'white' }}>
                    <Pagination
                      count={totalPages}
                      page={parameters.page}
                      onChange={handlePageChange}
                      color={"primary"}
                      variant="outlined"
                      shape="rounded"
                      sx={{
                          borderRadius: '4px',
                          padding: '10px',
                          backgroundColor: 'white'
                      }}
                    />
                </Box>
              )}
          </Box>
      </Box>
    );
}
export default MainLayout;

