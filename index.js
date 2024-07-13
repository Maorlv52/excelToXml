const fs = require('fs');
const xlsx = require('xlsx');
const xmlbuilder = require('xmlbuilder');
const { transliterate } = require('hebrew-transliteration');

const readExcelFile = (filePath) => {
    console.log(`Reading Excel file from ${filePath}`);
    const workbook = xlsx.readFile(filePath, { type: 'file' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(worksheet);
    console.log(`Read ${jsonData.length} rows from Excel file`);
    return jsonData;
};

const readCityNamesFromExcel = (filePath) => {
    console.log(`Reading city names from Excel file ${filePath}`);
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const cityNames = xlsx.utils.sheet_to_json(worksheet, { header: 1 })
        .map(row => row[0])
        .filter((cityName, index) => index > 0 && cityName);
    console.log(`Extracted ${cityNames.length} city names`);
    return cityNames;
};

const cleanText = (text) => {
    console.log(`Cleaning text: ${text}`);
    if (!text) return null;
    return text.replace(/[\r\n]/g, '').trim();
};

const getCityName = (text, cityNames) => {
    console.log(`Getting city name from text: ${text}`);
    if (!text) return null;
    text = text.replace(/[\r\n]/g, '').trim();

    for (const cityName of cityNames) {
        if (text.includes(cityName)) {
            console.log(`Found city name: ${cityName}`);
            return cityName;
        }
    }
    console.log(`No city name found in text: ${text}`);
    return null;
};

const extractHouseNumber = (text) => {
    console.log(`Extracting house number from text: ${text}`);
    if (typeof text === 'string') {
        const matches = text.match(/\d+/);
        const houseNumber = matches ? matches[0] : "";
        console.log(`Extracted house number: ${houseNumber}`);
        return houseNumber;
    }
    return "";
};

const convertToXML = (jsonData, cityNames) => {
    console.log(`Converting JSON data to XML`);
    const root = xmlbuilder.create('root');
    jsonData.forEach((row) => {
        const student = root.ele('Student');
        student.ele('ID', row['סטודנט: ת.ז'] || "");
        student.ele('Name', cleanText(row['סטודנט: שם מלא']) || "");
        student.ele('City', getCityName(row['סטודנט: כתובת מלאה'], cityNames) || "");
        student.ele('Street', cleanText(row['סטודנט: כתובת מלאה']) || "");
        student.ele('HouseNumber', extractHouseNumber(row['סטודנט: כתובת מלאה']) || "");
        student.ele('JobPlace', cleanText(row['סטודנט: מקום עבודה']) || "");
        student.ele('Email', row['סטודנט: דוא"ל'] || "");
    });
    const xmlData = root.end({ pretty: true });
    console.log(`Converted JSON data to XML successfully`);
    return xmlData;
};

const saveXMLToFile = (xmlData, outputFilePath) => {
    console.log(`Saving XML data to file ${outputFilePath}`);
    fs.writeFileSync(outputFilePath, xmlData);
    console.log(`XML data saved to file ${outputFilePath}`);
};

const getNextFileNumber = () => {
    const counterFilePath = 'counter.txt';
    console.log(`Getting next file number from ${counterFilePath}`);
    let number = 1;

    if (fs.existsSync(counterFilePath)) {
        number = parseInt(fs.readFileSync(counterFilePath, 'utf8'), 10);
    }

    fs.writeFileSync(counterFilePath, (number + 1).toString());
    console.log(`Next file number is ${number}`);
    return number;
};

const main = (inputFilePath) => {
    console.log(`Main function started with input file path: ${inputFilePath}`);
    const cityNamesFilePath = '/Users/Maor.Levinshtein/Documents/Barkan-scripts/settlements/settlements.xlsx';

    const fileNumber = getNextFileNumber();
    const outputFilePath = `/Users/Maor.Levinshtein/Documents/Barkan-scripts/results/studentsXml${fileNumber}.xml`;

    const jsonData = readExcelFile(inputFilePath);
    const cityNames = readCityNamesFromExcel(cityNamesFilePath);

    const xmlData = convertToXML(jsonData, cityNames);
    saveXMLToFile(xmlData, outputFilePath);

    console.log(`XML file has been saved to ${outputFilePath}`);
    return outputFilePath; // Ensure this is returned after the file is saved
};

module.exports = { main };