# Github Repo Analyzer

## Usage
```node getTopRepos``` - get the top 200 repositories and save them to a file in your ```getTopResults``` directory.

To change the number of repositories retrieved, and the ranking value, and other values, go to getTopRepos.js.

Modify these variables:
```
	const sortBy = 'forks';
	const numPages = 2;
	const numPerPage = 100;
	const intervalWaitInSeconds = 10;
	const outputFileName = createOutputFileName(sortBy, numPages, numPerPage);
	const attributesToKeep = ['name', 'forks', 'size', 'stargazers_count', 'description', 'url', 'full_url'];
```

Then run ```node getTopRepos``` to get the new list. 

Once you have a file of data in ```/getTopResults/<results file>.json```,
run an analysis on the data:

```node Analyzer.js```