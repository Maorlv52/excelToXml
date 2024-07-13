const express = require('express');
const multer = require('multer');
const path = require('path');
const { main } = require('./index');  // Importing the main function from index.js
const app = express();
const port = 3000;

// Setup for file uploads
const upload = multer({ dest: 'uploads/' });

app.use(express.static('public'));

app.post('/upload', upload.single('file'), (req, res) => {
    console.log('Received a file upload request.');
    if (!req.file) {
        console.log('No file uploaded.');
        return res.status(400).send('No file uploaded.');
    }
    try {
        console.log(`Processing file: ${req.file.path}`);
        const xmlFilePath = main(req.file.path);
        const downloadPath = path.basename(xmlFilePath);
        console.log(`File processed successfully. XML file path: ${xmlFilePath}`);
        res.json({ message: 'הקובץ נטען בהצלחה', filePath: `/download/${downloadPath}` });
    } catch (error) {
        console.error('Error processing file:', error);
        res.status(500).send('Error processing file.');
    }
}); // Added missing closing curly brace

// Route to download the XML file
app.get('/download/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'results', filename); // Adjust directory as necessary
    console.log(`Download request for file: ${filename}`);
    res.download(filePath, filename, (err) => {
        if (err) {
            console.error('Error downloading file:', err);
            res.status(500).send('Error downloading file.');
        } else {
            console.log(`File downloaded successfully: ${filename}`);
        }
    });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
