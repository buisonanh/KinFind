(async () => {
    const fetch = await import('node-fetch');
    const fs = await import('fs');
    const { createWriteStream } = await import('fs');

    const apiKey = 'clxulov8i0001l0092iaqaekr';
    const postUrl = 'https://api.magicapi.dev/api/v1/magicapi/period/period';
    const getImagePredictionUrl = (predictionId) => `https://api.magicapi.dev/api/v1/magicapi/period/predictions/${predictionId}`;
    const inputImageUrl = 'http://i.pinimg.com/originals/b6/0f/7c/b60f7c62ae89bdd82167a0ed711d71bd.jpg';
    const targetAge = '50'; // You can set the desired target age

    const requestBody = {
        image: inputImageUrl,
        target_age: targetAge
    };

    // Function to post the image and get the prediction ID
    const postImageAndGetPredictionId = async () => {
        try {
            const response = await fetch.default(postUrl, {
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

    // Function to get the prediction using the prediction ID
    const getPrediction = async (predictionId) => {
        try {
            const response = await fetch.default(getImagePredictionUrl(predictionId), {
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

    // Polling function to check the prediction status
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

    // Function to download the image
    const downloadImage = async (url, filepath) => {
        const response = await fetch.default(url);
        const fileStream = createWriteStream(filepath);
        await new Promise((resolve, reject) => {
            response.body.pipe(fileStream);
            response.body.on('error', reject);
            fileStream.on('finish', resolve);
        });
    };

    // Main function to execute the process
    const main = async () => {
        const startTime = Date.now();

        console.log('Starting the process...');

        const predictionId = await postImageAndGetPredictionId();
        if (predictionId) {
            try {
                const result = await pollPrediction(predictionId);
                console.log('Final result:', result);

                if (result.status === 'succeeded' && result.result) {
                    const imageUrl = result.result;
                    const filepath = 'output.png'; // Save the image as output.png
                    await downloadImage(imageUrl, filepath);
                    console.log(`Image downloaded and saved as ${filepath}`);
                } else {
                    console.error('Image processing did not succeed. Status:', result.status);
                }
            } catch (error) {
                console.error(error.message);
            }
        } else {
            console.error('Failed to get prediction ID.');
        }

        const endTime = Date.now();
        console.log(`Total time taken: ${(endTime - startTime) / 1000} seconds`);
    };

    main();
})();
