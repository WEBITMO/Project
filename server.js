// eslint-disable-next-line no-undef
const express = require('express');
// eslint-disable-next-line no-undef
const fs = require('fs');
// eslint-disable-next-line no-undef
const cors = require('cors');
const app = express();
const port = 3001;


app.use(cors());
app.get('/api/v1/pipelines', (req, res) => {
  fs.readFile('src/data/pipelines.json', (err, data) => {
    if (err) res.status(500).send('Error reading file');
    else res.json(JSON.parse(data));
  });
});

app.get('/api/v1/models', (req, res) => {
  fs.readFile('src/data/models.json', (err, data) => {
    if (err) res.status(500).send('Error reading file');
    else res.json(JSON.parse(data));
  });
});

app.listen(port, () => {
  console.log(`Mock server running at http://localhost:${port}`);
});
