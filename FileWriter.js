'use strict';

const fs = require('fs');

function writeJsonFileSync(fileName, data) {
	const filePath = fileName + '.json';
	const jsonData = JSON.stringify(data, null, 2);
	return writeFileSync(filePath, jsonData);
}

function writeFileSync(filePath, data) {
	const file = fs.openSync(filePath, 'a');
	return new Promise((resolve, reject) => {
		fs.appendFileSync(file, data);
	});
}

module.exports = {
	writeJsonFileSync,
};
