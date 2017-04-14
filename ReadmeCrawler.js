'use strict';

const gh = require('./GithubRequest');

/**
@param {string} repositoryFullName, eg. 'rachelcarandang/github-repo-analyzer' 
@param {callback(err, stats)}
@return stats on the readme for the repository
*/
function getReadmeStatsForRepository(repositoryFullName, callback) {
	tryGetReadmeAsString(repositoryFullName)
		.then((readmeString) => {
			const stats = getReadmeStats(readmeString);
			callback(null, stats);
		})
		.catch((error) => {
			callback(new Error('Could not get stats for README for repository. Reason: ' + error.stack));
		});	
}

/**
@param {string} repositoryFullName - eg. 'rachelcarandang/github-repo-analyzer' 
*/
function tryGetReadmeAsString(repositoryFullName) {
	const endpoint = `/repos/${repositoryFullName}/readme`
	return new Promise((resolve, reject) => {
		gh.makeGithubRequest('GET', endpoint)
			.then((response) => {
				const readmeString = tryConvertReadmeToString(response);

				resolve(readmeString);
			}).catch((error) => {
				reject('Could not convert README to string: ' + error);
			});
	});
}

function tryConvertReadmeToString(readmeObject) {
	const encodedReadmeContent = readmeObject.content;
	if (!encodedReadmeContent) {
		throw new Error('There was no readme for the repository' + error);
	}
	try {
		const buffer = new Buffer(encodedReadmeContent, 'base64');
		return buffer.toString();
	} catch (error) {
		throw new Error('Could not decode README' + error);
	}
}

function getReadmeStats(readmeString) {
	const numWordsInCode = getNumWordsInCodeBlocks(readmeString);

	return {
		numWordsInCode,
	};
}

function getNumWordsInCodeBlocks(readmeString) {
	const codeBlocks = getCodeBlocks(readmeString);
	if (codeBlocks.length === 0) {
		throw new Error('No code blocks found in repository.');
	}
	const wordDelimitersInCodeBlockToIgnore = /[\/\#\s\[\]\}\}\(\)\n\;/\=\+\<\>\-\!]+/;
	let wordsInCodeBlock;
	let numWords = 0;
	codeBlocks.forEach((codeBlock) => {
		wordsInCodeBlock = codeBlock.split(wordDelimitersInCodeBlockToIgnore);
		numWords += wordsInCodeBlock.length;
	});
	return numWords;
}

function getCodeBlocks(string) {
	const regex = /\`\`\`([^`]*?)\`\`\`/g;
	const codeBlocks = [];
	let match;
	let codeWithinQuotes;
	while ((match = regex.exec(string)) !== null) {
		  codeWithinQuotes = match[1];
		  codeBlocks.push(codeWithinQuotes);
	}

	return codeBlocks;
}

module.exports = {
	getReadmeStatsForRepository,
}

