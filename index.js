const fs = require('fs');
const xlsx = require('xlsx');
const xmlbuilder = require('xmlbuilder');
const { transliterate } = require('hebrew-transliteration');

const readExcelFile = (filePath) => {
    const workbook = xlsx.readFile(filePath, { type: 'file' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    return xlsx.utils.sheet_to_json(worksheet);
};

const readCityNamesFromExcel = (filePath) => {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    return xlsx.utils.sheet_to_json(worksheet, { header: 1 })
        .map(row => row[0])
        .filter((cityName, index) => index > 0 && cityName);
};


const cleanText = (text) => {
    if (!text) return null;
    return text.replace(/[\r\n]/g, '').trim();
};

const getCityName = (text, cityNames) => {
    if (!text) return null;
    text = text.replace(/[\r\n]/g, '').trim();

    for (const cityName of cityNames) {
        if (text.includes(cityName)) {
            return cityName;
        }
    }
    return null;
};

const extractHouseNumber = (text) => {
    if (typeof text === 'string') {
        const matches = text.match(/\d+/);
        return matches ? matches[0] : "";
    }
    return "";
};



const convertToXML = (jsonData, cityNames) => {
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
    return root.end({ pretty: true });
};

const saveXMLToFile = (xmlData, outputFilePath) => {
    fs.writeFileSync(outputFilePath, xmlData);
};

const getNextFileNumber = () => {
    const counterFilePath = 'counter.txt';
    let number = 1;

    if (fs.existsSync(counterFilePath)) {
        number = parseInt(fs.readFileSync(counterFilePath, 'utf8'), 10);
    }

    fs.writeFileSync(counterFilePath, (number + 1).toString());
    return number;
};

const main = (inputFilePath) => {
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
// main();