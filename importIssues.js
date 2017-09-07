var querystring = require('querystring'),
  http = require('http'),
  fs = require('fs'),
  readline = require('readline'),
  csv = require("fast-csv"),
  randomColor = require('randomcolor');

//Your gitlab host
var host = '10.82.136.217';
//Your private key (http://yourgitlabinstance/profile/personal_access_tokens or http://yourgitlabinstance/profile/account) 
var privateToken = 'J_n6XdxJtw7j5Z3nwso8';
//Your project id or group%2FprojectName 
var projectId = 'gribo%2Ftest-import';
//The name of the csv file to read
var csvFileToRead = 'MyIssues.csv';

//Change index of your csv file
var ISSUE_ORIGINAL_ID_INDEX = 0; //Issue original id, added in issue description
var ISSUE_TITLE_INDEX = 1;
var ISSUE_PRIORITY_INDEX = 2;
var ISSUE_FOUNDER_INDEX = 4; //Issue was found by (not a gitlab user, added to description)
var ISSUE_DESCRIPTION_INDEX = 5; //Issue description, may contain line break
var ISSUE_SYSTEM_INDEX = 8;  //Issue is associated to a system version
var ISSUE_VERSION_INDEX = 7; //Issue was assign to version
var ISSUE_CRDR_INDEX = 6; //Issue is a CR or DR

function jsonToQueryString(json) {
    return  
        Object.keys(json).map(function(key) {
            return encodeURIComponent(key) + '=' +
                encodeURIComponent(json[key]);
        }).join('&');
}

function performRequest(endpoint, method, data, success) {
  var dataString = JSON.stringify(data);
  //console.log(dataString);
  var headers = {};

  endpoint += '?private_token=' + privateToken+'&'+jsonToQueryString(data);
  
  headers = {
    'Content-Type': 'application/json;charset=utf-8'
  };
  
  var options = {
    host: host,
    path: endpoint,
    method: method,
    headers: headers
  };

  var req = http.request(options, function(res) {
    res.setEncoding('utf-8');

    var responseString = '';

    res.on('data', function(data) {
      //console.log('Data received ' +data);
      responseString += data;
    });

    res.on('end', function() {
      console.log('End request');
      console.log(responseString);
      success();
      
      
    });
    res.on('error', function(error) {
      console.log(error);
      
    });
  });

  req.write(dataString);
  req.end();
}

function resumeCSVParsing() {
  csvstream.resume();
}


function getIssues() {
  performRequest('/api/v4/projects/'+projectId+'/issues', 'GET', {
    state: "opened"
  }, function(data) {
     console.log('Fetched ' + data);
     console.log('Fetched ' + data.length);
  });
}


function logSetElements(value1, value2, set) {
    console.log('s[' + value1 + '] = ' + value2);
}

function createLabelIfNotExists(labelValue) {
  if (!labels.has(labelValue)) {
    console.log('Label '+ labelValue+' does not exist');
    labels.add(labelValue);
    createLabel(labelValue);
  }
}

function createLabel(labelValue) {
    console.log('Creating label '+labelValue);
    performRequest('/api/v4/projects/'+projectId+'/labels', 'POST', {
      name: labelValue,
      color: randomColor()
    }, function(data) {
       console.log('Fetched ' + data); 
    });
}



function createIssue(title, labels, description) {

  performRequest('/api/v4/projects/'+projectId+'/issues', 'POST', {
      title: title,
      labels: labels,
      description : description
    }, function(data) {
      //keep csv parsing
      //we need to pause otherwise we get https://gitlab.com/gitlab-org/gitlab-ee/issues/2374
      setTimeout(resumeCSVParsing,3000);
    });
}


//Display all issues to test host + projectId + private key 
//getIssues();

var i = 0;
var labels = new Set(); 
                  
var csvstream = csv.fromPath(csvFileToRead, {delimiter: ';', header : true})
    .on("data", function(columns){
       
    
    console.log('Parsing line : '+columns);
    //Remove variable that are not required
    var title = columns[ISSUE_TITLE_INDEX];
    var priority = columns[ISSUE_PRIORITY_INDEX];
    var system = columns[ISSUE_SYSTEM_INDEX];
    var assignVersion =  columns[ISSUE_VERSION_INDEX];
    var crdr =  columns[ISSUE_CRDR_INDEX]; 
    
    //header does not work ?
    if (i>0) {
      createLabelIfNotExists(priority);
      createLabelIfNotExists(system);
      createLabelIfNotExists(crdr);
      createLabelIfNotExists(assignVersion);
    }
    //We create labels for all this variable
    var labelArray = [priority,system,crdr,assignVersion]; 
    //remove empty labels
    var filteredArr = labelArray.filter(function(val) {
	   return !(val === "" || typeof val == "undefined" || val === null);
     });

    //Keep new line in the issue
    var desc = columns[ISSUE_DESCRIPTION_INDEX].split(/\r?\n/);
    //console.log(desc.join('\n\n'));
    var description =  desc.join('\n\n')+'\n\n'+'**Found by :** ' +columns[ISSUE_FOUNDER_INDEX]+'\n\n'+'**ID TTSuite :** '+columns[ISSUE_ORIGINAL_ID_INDEX]; 
    //Check with i to import only a few line
    if (i>0 && i<5) {
      //we need to pause otherwise we get https://gitlab.com/gitlab-org/gitlab-ee/issues/2374
      csvstream.pause();
      console.log('create Issue with Title : '+title+' - Labels : '+filteredArr.join()+' - Description : '+description);
      
      createIssue(title,filteredArr.join(),description);
      
    } 
    i++;
    })
    .on("end", function(){
         console.log("CSV file parsing done, found Labels :");
         //Display labels to create them manually before importing issue
         labels.forEach(logSetElements);
      
    })
    .on("error", function (error) {
        console.log(error);
    });

