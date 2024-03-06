import React from 'react';
import { Link } from 'react-router-dom';
import { Typography } from '@mui/material';

const LogoLink = () => {
    return (
        <Link to="/" style={{ textDecoration: 'none', flexGrow: 1, display: 'flex', alignItems: 'center', color: 'inherit'}}>
            <Typography variant="h6" noWrap component="div">
                Neural Networks HUB
            </Typography>
        </Link>
    );
};

export default LogoLink;
