const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

function main(filePath) {
    try {
        // Load the workbook
        const workbook = xlsx.readFile(filePath);

        // Get the first sheet name
        const firstSheetName = workbook.SheetNames[0];

        // Get the worksheet
        const worksheet = workbook.Sheets[firstSheetName];

        // Convert worksheet to JSON
        const data = xlsx.utils.sheet_to_json(worksheet);

        // Define the path for the results file
        const resultsPath = path.join(__dirname, 'results', 'output.json');

        // Log before writing to the file
        console.log(`Writing data to ${resultsPath}`);

        // Write data to the results file
        fs.writeFileSync(resultsPath, JSON.stringify(data, null, 2));

        // Log after successful write
        console.log(`Data written successfully to ${resultsPath}`);

        // Return the path for further use (e.g., sending it back to the client)
        return resultsPath;
    } catch (error) {
        // Log any errors that occur during the process
        console.error('Failed to write results:', error);
    }
}

module.exports = { main };
