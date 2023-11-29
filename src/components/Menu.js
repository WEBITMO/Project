import React from 'react';
import { Link } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

function Menu() {
    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" style={{ flexGrow: 1 }}>
                    NN Hub
                </Typography>
                <Button color="inherit" component={Link} to="/">Главная</Button>
                <Button color="inherit" component={Link} to="/#about">О нас</Button>
                <Button color="inherit" component={Link} to="/#contact">Контакты</Button>
                {/* другие ссылки здесь */}
            </Toolbar>
        </AppBar>
    );
}

export default Menu;
