'use strict';

const gh = require('./GithubRequest');
const fw = require('./FileWriter');

/**
Get the Top Repositories sorted by:
@param sortBy | one of 'forks', 'stars', 'updated'

See https://developer.github.com/v3/search/ for more API options
*/
function getTop() {
	const sortBy = 'forks';
	const numPages = 5;
	const numPerPage = 100;
	const intervalWaitInSeconds = 10;
	const outputFileName = createOutputFileName(sortBy, numPages, numPerPage);
	const attributesToKeep = ['name', 'forks', 'size', 'stargazers_count', 'description', 'url', 'full_url'];

	console.log(`Getting top ${numPages*numPerPage} Github Repositories sorted by ${sortBy}.
		Estimated time to completion:  ${intervalWaitInSeconds*numPages/60} minutes.
		Output file can be found at: ${outputFileName}.json`);

	getTopReposAtIntervals(outputFileName, sortBy, numPages, numPerPage, 
		attributesToKeep, intervalWaitInSeconds, numPages);
}

function createOutputFileName(sortBy, numPages, numPerPage) {
	const numReposRetrieved = numPages*numPerPage;
	const dateInt = Date.now();
	return `github_repos_top${numReposRetrieved}_${sortBy}_${dateInt}`;
}

function getTopReposAtIntervals(outputFileName, sortBy, numPages, 
	numPerPage, attributesToKeep, intervalWaitInSeconds, iterationsLeft) {
	let secondsBetweenIntervals = intervalWaitInSeconds;
	if (iterationsLeft === 0) {
		return;
	} else if (isFirstIteration(iterationsLeft, numPages)) {
		secondsBetweenIntervals = 0;
	}
	let page = numPages - iterationsLeft + 1;
	setTimeout(() => {
		getAndSaveTopReposForPage(outputFileName, sortBy, page, numPerPage, attributesToKeep);
		getTopReposAtIntervals(outputFileName, sortBy, numPages, 
			numPerPage, attributesToKeep, intervalWaitInSeconds, iterationsLeft - 1)
	}, secondsBetweenIntervals*1000);
}

function isFirstIteration(iterationsLeft, totalNumPages) {
	return iterationsLeft === totalNumPages;
}

function getAndSaveTopReposForPage(outputFileName, sortBy, page, numPerPage, attributesToKeep)  {
	makeGetTopReposRequest(sortBy, page, numPerPage)
		.then((jsonResponseBody) => {
			const repoList = jsonResponseBody.items;
			const cleanRepoList = filterRepoItemsToTheseAttributes(repoList, attributesToKeep);
			console.log('Writing Repos for page ' + page + ' to file');
			fw.writeJsonFileSync(outputFileName, cleanRepoList);
		})
		.catch((err) => console.error('Error:', err.stack));
}

/** 
/* @param attributesToKeep | list of attributes. Optional. If not specified,
/* keeps all attributes
/* See sampleGetReposSearchResponse.json for full list of attributes
*/
function filterRepoItemsToTheseAttributes(repoList, attributesToKeep) {
	if (!attributesToKeep) {
		return repoList;
	}
	console.log('Filtering only repository attributes we care about...');
	const cleanRepos = []
	repoList.forEach((repo) => {

		const cleanRepoDict = {};
		attributesToKeep.forEach((attribute) => {
			cleanRepoDict[attribute] = repo[attribute];
		});

		cleanRepos.push(cleanRepoDict);
	});
	return cleanRepos;
}

function makeGetTopReposRequest(sortBy, page, numPerPage) {
	console.log('Making Get Top Repos Request for page ' + page);
	const endpoint = '/search/repositories';
	const queryString = `?q=stars:">1"&sort=${sortBy}&order=desc&per_page=${numPerPage}&page=${page}`;
	
	return gh.makeGithubRequest('GET', endpoint, queryString);
}

getTop();