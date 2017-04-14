# Github Repo Analyzer

## Usage
```node getTopRepos``` - get the top 500 repositories and save them to a file in your directory.

To change the number of repositories retrieved, and the ranking value, and other values, go to getTopRepos.js.

Modify these variables:
```
	const sortBy = 'forks';
	const numPages = 5;
	const numPerPage = 100;
	const intervalWaitInSeconds = 10;
	const outputFileName = createOutputFileName(sortBy, numPages, numPerPage);
	const attributesToKeep = ['name', 'forks', 'size', 'stargazers_count', 'description', 'url', 'full_url'];
```

Then run ```node getTopRepos``` to get the new list. 