'use strict';

const request = require('request');
const AuthConfig = require('./AuthConfig');

function makeGithubRequest(method, endpoint, queryString) {
	const searchRequest = _createGitHubRequest(method, endpoint, queryString);
	return new Promise((resolve, reject) => {
		request(searchRequest, (err, response, body) => {
			if (err) {
				reject('Failed to send request to Github: ' + err);
			} 
			const responseBody = JSON.parse(body);

			resolve(responseBody);
		});
	});
}

function _createGitHubRequest(method, endpoint, queryString) {
	validateGithubRequestBeforeSending();
	return {
		uri: 'https://api.github.com' + endpoint + queryString,
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

module.exports = {
	makeGithubRequest,
}

