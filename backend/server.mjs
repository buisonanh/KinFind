import express from 'express';
import fetch from 'node-fetch';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3000;

const apiKey = 'clxulov8i0001l0092iaqaekr';
const postUrl = 'https://api.magicapi.dev/api/v1/magicapi/period/period';
const getImagePredictionUrl = (predictionId) => `https://api.magicapi.dev/api/v1/magicapi/period/predictions/${predictionId}`;
const inputImageUrl = 'https://blackpinkupdate.com/wp-content/uploads/2018/07/BLACKPINK-Jisoo-baby-kid-photo.jpg';
const targetAge = '50'; // You can set the desired target age

const requestBody = {
    image: inputImageUrl,
    target_age: targetAge
};

const postImageAndGetPredictionId = async () => {
    try {
        const response = await fetch(postUrl, {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'x-magicapi-key': apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        const data = await response.json();
        console.log('POST response data:', data); // Log the response data
        return data.request_id; // Use request_id from the response
    } catch (error) {
        console.error('Error in POST request:', error);
    }
};

const getPrediction = async (predictionId) => {
    try {
        const response = await fetch(getImagePredictionUrl(predictionId), {
            method: 'GET',
            headers: {
                'accept': 'application/json',
                'x-magicapi-key': apiKey
            }
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error in GET request:', error);
    }
};

const pollPrediction = async (predictionId) => {
    const interval = 5000; // 5 seconds interval
    const maxAttempts = 20; // Maximum number of attempts
    let attempts = 0;

    while (attempts < maxAttempts) {
        const data = await getPrediction(predictionId);
        console.log('GET response data:', data);

        if (data.status !== 'processing') {
            return data;
        }

        await new Promise(resolve => setTimeout(resolve, interval));
        attempts++;
    }

    throw new Error('Max attempts reached. Image processing took too long.');
};

const downloadImage = async (url, filepath) => {
    const response = await fetch(url);
    const fileStream = fs.createWriteStream(filepath);
    await new Promise((resolve, reject) => {
        response.body.pipe(fileStream);
        response.body.on('error', reject);
        fileStream.on('finish', resolve);
    });
};

app.get('/age_transform', async (req, res) => {
    try {
        const predictionId = await postImageAndGetPredictionId();
        if (predictionId) {
            try {
                const result = await pollPrediction(predictionId);
                console.log('Final result:', result);

                if (result.status === 'succeeded' && result.result) {
                    const outputImageUrl = result.result;

                    // Save the input and output images
                    const inputImagePath = path.join(__dirname, 'input', 'input_image.jpg');
                    const outputImagePath = path.join(__dirname, 'output', 'output_image.jpg');

                    await downloadImage(inputImageUrl, inputImagePath);
                    await downloadImage(outputImageUrl, outputImagePath);

                    res.json({ imageUrl: `/output/output_image.jpg` });
                } else {
                    res.status(500).json({ error: `Image processing did not succeed. Status: ${result.status}` });
                }
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        } else {
            res.status(500).json({ error: 'Failed to get prediction ID.' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Serve the input and output directories statically
app.use('/input', express.static(path.join(__dirname, 'input')));
app.use('/output', express.static(path.join(__dirname, 'output')));

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
