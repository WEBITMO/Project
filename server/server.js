const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = 3001;

// eslint-disable-next-line no-undef
const backendUrl = process.env.BACKEND_URL;

app.use('/', createProxyMiddleware({
    target: backendUrl,
    changeOrigin: true
}));

app.listen(port, () => {
    console.log(`Proxy server listening at http://localhost:${port}`);
});
