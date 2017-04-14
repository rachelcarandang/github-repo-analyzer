'use strict';

const fs = require('fs');

function writeJsonFileSync(fileName, jsonDataList) {
	const filePath = fileName + '.json';
	jsonDataList.forEach((jsonBlob) => {
		const data = JSON.stringify(jsonBlob, null, 2);
		writeFileSync(filePath, data + '\n');
	});
}

function writeFileSync(filePath, data) {
	const file = fs.openSync(filePath, 'a');
	fs.appendFileSync(file, data);
}

module.exports = {
	writeJsonFileSync,
};
