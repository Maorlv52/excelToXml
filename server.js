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
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    try {
        const xmlFilePath = main(req.file.path);  // Get the path of the XML file
        const downloadPath = path.basename(xmlFilePath); // Extract filename for safe routing
        res.json({ message: 'הקובץ נטען בהצלחה', filePath: `/download/${downloadPath}` });
    } catch (error) {
        console.error('Error processing file:', error);
        res.status(500).send('Error processing file.');
    }
});

// Route to download the XML file
app.get('/download/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'results', filename); // Adjust directory as necessary
    res.download(filePath, filename, (err) => {
        if (err) {
            console.error('Error downloading file:', err);
            res.status(500).send('Error downloading file.');
        }
    });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

