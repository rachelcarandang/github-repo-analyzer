'use strict';

const request = require('request');
const AuthConfig = require('./AuthConfig');

/**
@param {string} method - required
@param {string} endpoint - required
@param {string} queryString - optional
*/
function makeGithubRequest(method, endpoint, queryString) {
	validateGithubRequestBeforeSending();
	const fullEndpoint = createFullEndpointFromWhatIsSupplied(endpoint, queryString);
	const searchRequest = _createGitHubRequest(method, fullEndpoint);
	return new Promise((resolve, reject) => {
		request(searchRequest, (err, response, body) => {
			if (err) {
				console.log('Failed to send request to Github ' + err + ' ' + err.stack);
				reject('Failed to send request to Github: ' + err);
			} 
			console.log('headers', response.headers);
			const responseBody = JSON.parse(body);
			resolve(responseBody);
		});
	});
}

function _createGitHubRequest(method, fullEndpoint) {
	return {
		uri: 'https://api.github.com' + fullEndpoint,
		method,
		headers: {
			'Content-Type': 'application/json',
			'User-Agent': 'rachelcarandang/github-repo-analyzer',
			'Authorization': `token ${AuthConfig.TOKEN}`,
		},
	};
}

function validateGithubRequestBeforeSending() {
	const authToken = AuthConfig.TOKEN;
	if (!authToken) {
		throw new Error(`Cannot send Github Request: need auth token.
			1. To generate a token, go to https://github.com/settings/tokens.
			2. Paste the token in AuthConfig.js`);
	}
}

function createFullEndpointFromWhatIsSupplied(endpoint, queryString) {
	if (!queryString || queryString === '') {
		return endpoint;
	}
	return endpoint + queryString;
}

module.exports = {
	makeGithubRequest,
}


