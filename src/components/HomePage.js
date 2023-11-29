import React from 'react';
import { Container, Typography, Box } from '@mui/material';
function HomePage() {
    return (
        <Container maxWidth="md">
            <Box my={4}>
                <Typography variant="h4" component="h2" gutterBottom>
                    О нас
                </Typography>
                <Typography variant="body1">
                    Здесь информация о вашей компании или проекте...
                </Typography>
                {/* Дополнительный контент */}
            </Box>

            <Box my={4}>
                <Typography variant="h4" component="h2" gutterBottom>
                    Контакты
                </Typography>
                <Typography variant="body1">
                    Как с нами связаться...
                </Typography>
                {/* Форма обратной связи или контактная информация */}
            </Box>
        </Container>
    );
}
export default HomePage;
