import React from 'react';
import { Box, Container, Typography, Link } from '@mui/material';
function Footer() {
    return (
        <Box component="footer" sx={{ bgcolor: 'background.paper', py: 6 }}>
            <Container maxWidth="lg">
                <Typography variant="h6" align="center" gutterBottom>
                    Мой Футер
                </Typography>
                <Typography variant="subtitle1" align="center" color="textSecondary" component="p">
                    Что-то важное о компании или проекте.
                </Typography>
                <Typography variant="body2" color="textSecondary" align="center">
                    {'Copyright © '}
                    <Link color="inherit" href="https://yourwebsite.com/">
                        NNHub
                    </Link>{' '}
                    {new Date().getFullYear()}
                    {'.'}
                </Typography>
            </Container>
        </Box>
    );
}

export default Footer;
