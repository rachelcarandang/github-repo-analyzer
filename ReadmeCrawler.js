'use strict';

const gh = require('./GithubRequest');
const fio = require('./FileIO');
	let numReposAnalyzed = 0;
	let numReposFailedToAnalyze = 0;
	let arr = [];

analyzeAllRepositories();

function analyzeAllRepositories() {
	const SOURCE_FILE_NAME = 'getTopResults/github_repos_top100_forks_1492156724692';
	console.log('Analyzing the READMEs of all repositories found in file: ' + SOURCE_FILE_NAME);
	const lineReader = fio.getLineReaderForFile(SOURCE_FILE_NAME + '.json');
	let numLines = 0;
	let currLine = 0;
	let TOTAL_NUM_LINES = 100;
	lineReader.on('line', (line) => {
		numLines++;
		try {
			const repo = JSON.parse(line);
			const repositoryFullName = repo.full_name;
			const repoSizeInKb = repo.size;
			let num = numReposAnalyzed;
			setTimeout(() => {

				getReadmeStatsForRepository(repositoryFullName, (error, stats) => {
					if (error) {
						// console.log(`Error getting stats for README for repository: ${repo.url}. Skipping this repository.  Reason: ` + error);
						numReposFailedToAnalyze++;
						currLine++;

						if (isEndOfFile(currLine, TOTAL_NUM_LINES)) {
							computeStats(arr);
						}
						return;
					}
					numReposAnalyzed++; 
					arr.push({
						wordsInCodeInReadme: stats.numWordsInCode,
						repoSizeInKb,
					});
					currLine++;
					// last line of file, compute stats
					if (isEndOfFile(currLine, TOTAL_NUM_LINES)) {
							computeStats(arr);
						}
				});

			}, 1000);
		} catch (error) {
			currLine++;
			if (isEndOfFile(currLine, TOTAL_NUM_LINES)) {
						computeStats(arr);
					}
			console.log(`Error getting stats for README for repository: ${repo.url}. Could not read repository information from the results file: ${SOURCE_FILE_NAME}`);
		}

	}).on('close', () => {
		TOTAL_NUM_LINES = numLines;
	});

}

function isEndOfFile(currLine, totalNumLines) {
	return totalNumLines && (currLine === totalNumLines);
}

function computeStats(arr) {
	if (arr.length === 0) {
		throw new Error('length of statistics cannot be 0');
	}

	// popular repositories had an average of code words per repository size
	let average = 0;
	let codeRate;
	let absoluteWordsOfCode = 0;
	arr.forEach((stat) => {
		codeRate = stat.wordsInCodeInReadme/stat.repoSizeInKb;
		average += codeRate;
		absoluteWordsOfCode += stat.wordsInCodeInReadme;
	});
	const totalWithCodeInReadme = arr.length;
	const codeRateAverage = average/arr.length;
	const absoluteWordsOfCodeAverage = absoluteWordsOfCode/arr.length;
	const analysis = {
		totalWithCodeInReadme,
		codeRateAverage,
		absoluteWordsOfCodeAverage,
	}
	console.log('analysis ' + JSON.stringify(analysis, null, 2));
}

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

