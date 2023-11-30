import React, { useState } from 'react';
import { Box, TextField, Button, List, ListItem, ListItemText, Paper, Typography } from '@mui/material';

const ChatPage = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    // const [recording, setRecording] = useState(false);
    // const [mediaRecorder, setMediaRecorder] = useState(null);
    // const [audioChunks, setAudioChunks] = useState([]);
    //
    const sendMessage = () => {
        setMessages([...messages, input]);
         setInput('');
     };
    // const handleFileChange = (event) => {
    //     const file = event.target.files[0];
    //     // Обработка файла
    // };
    // const startRecording = () => {
    //     navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
    //         const recorder = new MediaRecorder(stream);
    //         recorder.ondataavailable = (event) => {
    //             setAudioChunks((prev) => [...prev, event.data]);
    //         };
    //         recorder.start();
    //         setMediaRecorder(recorder);
    //         setRecording(true);
    //     });
    // };
    //
    // const stopRecording = () => {
    //     mediaRecorder.stop();
    //     setRecording(false);
    //     // Обработка audioChunks
    // };

    return (
        <Box sx={{ maxWidth: 500, margin: 'auto' }}>
            <Typography variant="h4" sx={{ textAlign: 'center' }}>Чат</Typography>
            <Paper elevation={3} sx={{ maxHeight: 600, overflow: 'auto', mb: 2 }}>
                <List>
                    {messages.map((msg, index) => (
                        <ListItem key={index}>
                            <ListItemText primary={msg} />
                        </ListItem>
                    ))}
                </List>
            </Paper>
            <Box display="flex">
                <TextField
                    fullWidth
                    variant="outlined"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Введите сообщение..."
                />
                <Button variant="contained" color="primary" onClick={sendMessage}>
                    Отправить
                </Button>
            </Box>
        </Box>
    );
};

export default ChatPage;
