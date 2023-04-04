const express = require('express');
const axios = require('axios');
const app = express();

const API_URL = 'https://api-dot-cis3111-2023-class.ew.r.appspot.com';

app.get('/', async (req, res) => {
  // Generate random numbers
  await axios.post(`${API_URL}/generate`);

  // Get the results
  const results = await axios.get(`${API_URL}/results`);

  res.send(results.data);
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Frontend server listening on port ${PORT}`);
});
