'use strict';

const fio = require('./FileIO');
const rc = require('./ReadmeCrawler');

let numReposAnalyzed = 0;
let numReposFailedToAnalyze = 0;
let arr = [];

/**
Run analysis of READMEs of repositories
*/
const sourceDataFileName = 'getTopResults/github_repos_top200_forks_desc_1492160876190';
analyzeAllRepositories(sourceDataFileName);

const repositoryNames = [];

/**
@ param {string} sourceDataFileName - the json file of repository items you want to analyze
@ return {dict} analysis of the average code in a README, and other statistics
*/
function analyzeAllRepositories(sourceDataFileName) {
	console.log('Analyzing the READMEs of all repositories found in file: ' + sourceDataFileName);
	const lineReader = fio.getLineReaderForFile(sourceDataFileName + '.json');
	let numLines = 0;
	let currLine = 0;
	let TOTAL_NUM_LINES = 100;
	lineReader.on('line', (line) => {
		numLines++;
		// Have no idea why, but this console.log statement fixes things. Should revert again. 
		console.log(line);
		try {
			const repo = JSON.parse(line);
			const repositoryFullName = repo.full_name;
			const repoSizeInKb = repo.size;
			let num = numReposAnalyzed;
			rc.getReadmeStatsForRepository(repositoryFullName, (error, stats) => {
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
				if (isEndOfFile(currLine, TOTAL_NUM_LINES)) {
					computeStats(arr);
				}
			});
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
	// average of code words per repository size
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