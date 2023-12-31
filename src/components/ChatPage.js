import React, { useState } from 'react';
import { Box, TextField, List, ListItem, ListItemText, Paper, CircularProgress, IconButton } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import SendIcon from '@mui/icons-material/Send';
const ChatPage = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [recording, setRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [audioChunks, setAudioChunks] = useState([]);
    const [isUploading, setIsUploading] = useState(false);

    const sendMessage = () => {
        setMessages([...messages, input]);
         setInput('');
     };
    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        setIsUploading(true);
        // Отправьте файл на сервер или обработайте локально
        // После обработки файла:
        setMessages([...messages, `Файл: ${file.name}`]);
        setIsUploading(false);
    };
    const startRecording = () => {
        navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
            const recorder = new MediaRecorder(stream);
            recorder.ondataavailable = (event) => {
                setAudioChunks((prev) => [...prev, event.data]);
            };
            recorder.start();
            setMediaRecorder(recorder);
            setRecording(true);
        });
    };

    const stopRecording = () => {
        mediaRecorder.stop();
        mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(audioChunks);
            const audioUrl = URL.createObjectURL(audioBlob);
            setMessages([...messages, `Аудиозапись: ${audioUrl}`]);
            setAudioChunks([]);
        };
        setRecording(false);
    };

    return (
      <Box display="flex" flexDirection="column" height="100vh">
        <Box sx={{ flexGrow: 1, overflow: 'auto', maxWidth: 500, width: '100%', mx: 'auto' }}>
          <Paper elevation={3} sx={{ maxHeight: 'calc(100vh - 180px)', overflow: 'auto', mb: 2 }}>
            <List>
              {messages.map((msg, index) => (
                <ListItem key={index}>
                  <ListItemText primary={msg} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Box>

        <Box sx={{ maxWidth: 500, width: '100%', mx: 'auto' }}>
          <Box display="flex" alignItems="center">
            <TextField
              fullWidth
              variant="outlined"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Введите сообщение..."
            />
            <IconButton color="primary" onClick={sendMessage}>
              <SendIcon />
            </IconButton>
            {isUploading && <CircularProgress size={24} />}
            <IconButton color="primary" onClick={startRecording} disabled={recording}>
              <MicIcon />
            </IconButton>
            {recording && <CircularProgress size={24} />}
            <IconButton color="primary" onClick={stopRecording} disabled={!recording}>
              <StopIcon />
            </IconButton>
            <label htmlFor="file-upload">
              <input
                accept="*/*"
                id="file-upload"
                type="file"
                hidden
                onChange={handleFileChange}
              />
              <IconButton color="primary" component="span">
                <UploadFileIcon />
              </IconButton>
            </label>
          </Box>
        </Box>
      </Box>
    );
};

export default ChatPage;
