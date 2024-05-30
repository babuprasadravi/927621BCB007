const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = 9876;
const WINDOW_SIZE = 10;

// Data structure to hold numbers
let windowPrevState = [];
let windowCurrState = [];

// Qualified IDs
const qualifiedIds = {
    'p': 'p',
    'f': 'f',
    'e': 'e',
    'r': 'r'
};

// External API URLs
const apiUrls = {
    'prime': 'http://20.244.56.144/test/p',
    'fibonacci': 'http://20.244.56.144/test/f',
    'even': 'http://20.244.56.144/test/e',
    'random': 'http://20.244.56.144/test/r'
};

// Utility function to calculate average
const calculateAverage = (numbers) => {
    const sum = numbers.reduce((acc, num) => acc + num, 0);
    return numbers.length ? (sum / numbers.length) : 0;
};

// Endpoint to handle requests
app.get('/numbers/:id', async (req, res) => {
    const id = req.params.id;
    if (!qualifiedIds[id]) {
        return res.status(400).json({ error: 'Invalid ID' });
    }

    const type = qualifiedIds[id];

    try {
        const response = await axios.get(apiUrls[type], {
            headers: {
                Authorization: `Bearer ${process.env.TOKEN}`
            }
        });

        const newNumbers = response.data.numbers;

        // Remove duplicates
        const uniqueNewNumbers = newNumbers.filter(num => !windowCurrState.includes(num));
        
        // Update the window state
        windowPrevState = [...windowCurrState];
        windowCurrState = [...windowCurrState, ...uniqueNewNumbers].slice(-WINDOW_SIZE);

        // Calculate average
        const average = calculateAverage(windowCurrState);

        // Format the response
        const responseData = {
            windowPrevState,
            windowCurrState,
            numbers: newNumbers,
            avg: average
        };

        return res.json(responseData);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to fetch numbers from third-party server' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
