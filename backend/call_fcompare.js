const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Path to the image file you want to upload
const imagePath = path.join(__dirname, 'output9.png');

// Create a form and append the image file
const form = new FormData();
form.append('image', fs.createReadStream(imagePath));

// Send a POST request to the Flask API
axios.post('http://127.0.0.1:5000/compare_faces', form, {
    headers: {
        ...form.getHeaders()
    }
})
.then(response => {
    console.log('Response data:', response.data);
})
.catch(error => {
    console.error('Error:', error);
});