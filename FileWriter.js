'use strict';

const fs = require('fs');

function writeJsonFileSync(fileName, data) {
	const filePath = fileName + '.json';
	const jsonData = JSON.stringify(data, null, 2);
	writeFileSync(filePath, jsonData);
}

function writeFileSync(filePath, data) {
	const file = fs.openSync(filePath, 'a');
	fs.appendFileSync(file, data);
}

module.exports = {
	writeJsonFileSync,
};
