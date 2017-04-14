'use strict';

const fs = require('fs');
const readline = require('readline');

/**
@param {string} fileName - file of newline delimited json objects
*/
function getLineReaderForFile(filePath) {
	const lineReader = readline.createInterface({
  		input: fs.createReadStream(filePath),
	});

	return lineReader;
}

function writeJsonFileSync(fileName, jsonDataList) {
	const filePath = fileName + '.json';
	jsonDataList.forEach((jsonBlob) => {
		const data = JSON.stringify(jsonBlob);
		writeFileSync(filePath, data + '\n');
	});
}

function writeFileSync(filePath, data) {
	const file = fs.openSync(filePath, 'a');
	fs.appendFileSync(file, data);
}

module.exports = {
	getLineReaderForFile,
	writeJsonFileSync,
};
