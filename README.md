This project allows the import of issues from a CSV file into your gitlab instance

It as been created for the need of a one shoot import, it is not usable as this for your need,
but it should be simple enough to made some change to feet your needs.

## Requirement

* NodeJS
* Your gitlab instance and info


## Run

```js
npm install fast-csv randomcolor
```
Copy your csv file into the same directory

Edit importIssues.js and change your gitlab host, your personal gitlab key, your project name and your csv filename :
```js
//Your gitlab host
var host = '10.82.136.217';
//Your private key (http://yourgitlabinstance/profile/personal_access_tokens or http://yourgitlabinstance/profile/account) 
var privateToken = 'J_n6XdxJtw7j5Z3nwso8';
//Your project id or group%2FprojectName 
var projectId = 'gribo%2Ftest-import';
//The name of the csv file to read
var csvFileToRead = 'MyIssues.csv';
```

Configure your columns index and your csv separator :
```js

//Change index of your csv file
var ISSUE_ORIGINAL_ID_INDEX = 0; //Issue original id, added in issue description
var ISSUE_TITLE_INDEX = 1;
var ISSUE_PRIORITY_INDEX = 2;
var ISSUE_FOUNDER_INDEX = 4; //Issue was found by (not a gitlab user, added to description)
var ISSUE_DESCRIPTION_INDEX = 5; //Issue description, may contain line break
var ISSUE_SYSTEM_INDEX = 8;  //Issue is associated to a system version
var ISSUE_VERSION_INDEX = 7; //Issue was assign to version
var ISSUE_CRDR_INDEX = 6; //Issue is a CR or DR

```
Then launch
```sh
node importIssues.js
```

Known issue : https://gitlab.com/gitlab-org/gitlab-ee/issues/2374



