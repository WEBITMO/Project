import React, {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import {
    Container,
    Paper,
    Typography,
    AppBar,
    Toolbar,
    TextField,
    Button,
    List,
    ListItem,
    ListItemText,
    CircularProgress,
    Slider, IconButton, InputLabel, Tooltip
} from '@mui/material';
import LogoLink from "./LogoLink";
import DeleteIcon from '@mui/icons-material/Delete';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import InfoIcon from '@mui/icons-material/Info';

const modelUrls = {
    "Smaug-72B": "008cff6d-4f4c-4514-b61e-bcfad6ba52a7",
    "Phi-2B": "6251d6d2-54ee-4486-90f4-2792bf0d3acd",
    "Gemma-2B": "5bde8f6f-7e83-4413-a0f2-7b97be33988e",
    "Gemma-7B": "1361fa56-61d7-4a12-af32-69a3825746fa",
    "Mamba-Chat": "381be320-4721-4664-bd75-58f8783b43c7",
    "Code-Llama-70B": "2ae529dc-f728-4a46-9b8d-2697213666d8",
    "NV-Llama2-70B-RLHF-Chat": "7b3e3361-4266-41c8-b312-f5e33c81fc92",
    "NV-Llama2-70B-SteerLM-Chat": "d6fe6881-973a-4279-a0f8-e1d486c9618d",
    "Mixtral-8x7B-Instruct": "8f4118ba-60a8-4e6b-8574-e38a4067a4a3",
    "Yi-34B": "347fa3f3-d675-432c-b844-669ef8ee53df",
    "Nemotron-3-8B-Chat-SteerLM": "1423ff2f-d1c7-4061-82a7-9e8c67afd43a",
    "Llama-2-70B": "0e349b44-440a-44e1-93e9-abe8dcb27158",
    "Llama-2-13B": "e0bb7fb9-5333-4a27-8534-c6288f921d3f",
    "Code-Llama-13B": "f6a96af4-8bf9-4294-96d6-d71aa787612e",
    "Code-Llama-34B": "df2bee43-fb69-42b9-9ee5-f4eabbeaf3a8",
    "Mistral-7B-Instruct": "35ec3354-2681-4d0e-a8dd-80325dcf7c63"
};

function TextGenerationPage() {
    const {modelId} = useParams();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [invokeUrl, setInvokeUrl] = useState('');

    const [temperature, setTemperature] = useState(0.2);
    const [topP, setTopP] = useState(0.7);
    const [maxTokens, setMaxTokens] = useState(1024);
    const [seed, setSeed] = useState(42);
    const [apiKey, setApiKey] = useState('');
    const [apiKeyVisible, setApiKeyVisible] = useState(false);
    const [apiKeyError, setApiKeyError] = useState(false);

    useEffect(() => {
        const storedApiKey = localStorage.getItem('apiKey');
        if (storedApiKey) {
            setApiKey(storedApiKey);
        }
    }, []);

    useEffect(() => {
        if (modelUrls[modelId]) {
            setInvokeUrl(modelUrls[modelId]);
        } else {
            console.error(`No URL found for modelId: ${modelId}`);
        }
    }, [modelId]);

    useEffect(() => {
        localStorage.setItem('apiKey', apiKey);
    }, [apiKey]);

    const toggleApiKeyVisibility = () => {
        setApiKeyVisible(!apiKeyVisible);
    };

    const handleMouseDownApiKey = (event) => {
        event.preventDefault();
    };

    const clearHistory = () => {
        setMessages([]);
        setApiKeyVisible(false);
    };

    const handleApiKeyChange = (event) => {
        setApiKey(event.target.value);
    };

    const handleSendMessage = () => {
        if (!newMessage.trim()) return;

        const userMessage = {
            content: newMessage,
            role: 'user',
        };

        setMessages(prevMessages => [...prevMessages, userMessage]);

        const payload = {
            messages: [...messages, userMessage],
            temperature: temperature,
            top_p: topP,
            max_tokens: maxTokens,
            seed: seed || undefined,
            stream: true,
        };

        const headers = {
            "Authorization": `Bearer ${apiKey}`,
            "Accept": "text/event-stream",
            "Content-Type": "application/json",
        };

        setIsLoading(true);

        fetch(`https://api.nvcf.nvidia.com/v2/nvcf/pexec/functions/${invokeUrl}`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload),
        })
            .then(response => {
                if (response.status === 401) {
                    setApiKeyError(true);
                    setIsLoading(false);
                    alert('API key is wrong');
                    return;
                }
                setApiKeyError(false);
                setApiKeyVisible(false);


                const reader = response.body.getReader();
                let decoder = new TextDecoder();
                let botMessageAccumulated = '';

                const processText = ({done, value}) => {
                    if (done) {
                        setIsLoading(false);
                        return;
                    }

                    let chunk = decoder.decode(value, {stream: true});
                    let jsonChunks = chunk.split('\n\n');
                    jsonChunks.forEach(jsonChunk => {
                        if (jsonChunk) {
                            if (jsonChunk === 'data: [DONE]') {
                                setIsLoading(false);
                                return;
                            }

                            try {
                                let jsonData = jsonChunk.replace(/^data:/, '');
                                let apiResponse = JSON.parse(jsonData);

                                botMessageAccumulated += apiResponse.choices[0].delta.content;

                                setMessages(prevMessages => {
                                    const lastMessage = prevMessages[prevMessages.length - 1];
                                    const messagesWithoutLast = prevMessages.slice(0, -1);

                                    if (lastMessage && lastMessage.role === 'assistant') {
                                        return [...messagesWithoutLast, {
                                            content: botMessageAccumulated,
                                            role: 'assistant',
                                        }];
                                    } else {
                                        return [...prevMessages, {
                                            content: botMessageAccumulated,
                                            role: 'assistant',
                                        }];
                                    }
                                });

                            } catch (error) {
                                console.error('Error parsing response:', error);
                                console.log('Chunk:', jsonChunk);
                            }
                        }
                    });

                    reader.read().then(processText);
                };

                reader.read().then(processText);
            })
            .catch(error => {
                console.error("Error making request:", error);
                setIsLoading(false);
            });

        setNewMessage('');
    };

    return (
        <Container>
            <AppBar position="fixed">
                <Toolbar>
                    <LogoLink/>
                </Toolbar>
            </AppBar>
            <Toolbar/>
            <Paper style={{padding: '20px', marginTop: '80px'}}>
                <Typography variant="h4">Text Generation Model</Typography>
                <Typography variant="subtitle1">
                    Model ID: {modelId}
                </Typography>
                <FormControl sx={{m: 1, width: '25ch'}} variant="outlined">
                    <InputLabel htmlFor="outlined-adornment-api-key">API Key</InputLabel>
                    <OutlinedInput
                        error={apiKeyError}
                        id="outlined-adornment-api-key"
                        type={apiKeyVisible ? 'text' : 'password'}
                        value={apiKey}
                        onChange={handleApiKeyChange}
                        endAdornment={
                            <InputAdornment position="end">
                                <IconButton
                                    aria-label="toggle API key visibility"
                                    onClick={toggleApiKeyVisibility}
                                    onMouseDown={handleMouseDownApiKey}
                                    edge="end"
                                >
                                    {apiKeyVisible ? <VisibilityOff/> : <Visibility/>}
                                </IconButton>
                            </InputAdornment>
                        }
                        label="API Key"
                    />
                </FormControl>
                <div>
                    <Typography id="temperature-slider" gutterBottom>
                        Temperature
                        <Tooltip
                            title="The sampling temperature to use for text generation. The higher the temperature value is, the less deterministic the output text will be. It is not recommended to modify both temperature and top_p in the same call."
                            placement="top">
                            <InfoIcon fontSize="small" style={{marginLeft: 6, marginBottom: -6}} color="info"/>
                        </Tooltip>
                    </Typography>

                    <Slider
                        value={temperature}
                        onChange={(e, newValue) => setTemperature(newValue)}
                        aria-labelledby="temperature-slider"
                        step={0.1}
                        marks
                        min={0.1}
                        max={1}
                        valueLabelDisplay="auto"
                    />
                </div>
                <div>
                    <Typography id="top-p-slider" gutterBottom>
                        Top P
                        <Tooltip
                            title="The top-p sampling mass used for text generation. The top-p value determines the probability mass that is sampled at sampling time. For example, if top_p = 0.2, only the most likely tokens (summing to 0.2 cumulative probability) will be sampled. It is not recommended to modify both temperature and top_p in the same call."
                            placement="top">
                            <InfoIcon fontSize="small" style={{marginLeft: 6, marginBottom: -6}} color="info"/>
                        </Tooltip>
                    </Typography>
                    <Slider
                        value={topP}
                        onChange={(e, newValue) => setTopP(newValue)}
                        aria-labelledby="top-p-slider"
                        step={0.1}
                        marks
                        min={0.1}
                        max={1}
                        valueLabelDisplay="auto"
                    />
                </div>
                <div>
                    <Typography id="max-tokens-slider" gutterBottom>
                        Max Tokens
                        <Tooltip
                            title="The maximum number of tokens to generate in any given call. Note that the model is not aware of this value, and generation will simply stop at the number of tokens specified."
                            placement="top">
                            <InfoIcon fontSize="small" style={{marginLeft: 6, marginBottom: -6}} color="info"/>
                        </Tooltip>
                    </Typography>
                    <Slider
                        value={maxTokens}
                        onChange={(e, newValue) => setMaxTokens(newValue)}
                        aria-labelledby="max-tokens-slider"
                        step={64}
                        marks
                        min={1}
                        max={1024}
                        valueLabelDisplay="auto"
                    />
                </div>
                <div>
                    <Tooltip
                        title="If specified, our system will make a best effort to sample deterministically, such that repeated requests with the same seed and parameters should return the same result."
                        placement="top">
                        <TextField
                            fullWidth
                            value={seed}
                            onChange={(e) => setSeed(e.target.value)}
                            label="Seed"
                            margin="normal"
                            type="number"
                            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                        />
                    </Tooltip>
                </div>
                <List>
                    {messages.map((message, index) => (
                        <ListItem key={index}>
                            <ListItemText primary={message.content}
                                          secondary={message.role === 'assistant' ? 'Assistant' : 'You'}/>
                        </ListItem>
                    ))}
                </List>
                <TextField
                    fullWidth
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type your message here..."
                    margin="normal"
                />
                <Button variant="contained" color="primary" onClick={handleSendMessage} disabled={isLoading || !apiKey}>
                    Send
                </Button>
                <Button
                    variant="outlined"
                    color="secondary"
                    startIcon={<DeleteIcon/>}
                    onClick={clearHistory}
                    disabled={messages.length === 0 || isLoading}
                >
                    Clear History
                </Button>
                {isLoading && <CircularProgress size={24}/>}
            </Paper>
        </Container>
    );
}

export default TextGenerationPage;