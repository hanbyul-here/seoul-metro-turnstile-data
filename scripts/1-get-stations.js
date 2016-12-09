'use strict';

var fs = require('fs');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var key = require('./key').key;

var jsonfile = require('jsonfile');

//A: 공항철도, B: 분당선, G: 경춘선, K: 경의중앙선, S: 신분당선, SU: 수인선
var lines = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'G', 'K', 'S', 'SU'];
var lineCount = lines.length - 1;

var requestFrequency = 200; // time gap between requests to openAPI.seoul.go.kr:8080

function makeCall() {
  if (lineCount > -1) {
    var request = new XMLHttpRequest();

    var url = 'http://openAPI.seoul.go.kr:8088/'+key+'/json/SearchSTNBySubwayLineService/1/600/'+lines[lineCount];
    console.log(url);

    request.open('GET', url, true);
    request.onload = function() {
      if (request.status >= 200 && request.status < 400) {
        // Success!
        var data = JSON.parse(request.responseText);
        writeFile(data);
        lineCount--;

        setTimeout(makeCall, requestFrequency);
      } else {
        console.log('We reached our target server, but it returned an error')
      }
    }

    request.onerror = function() {
      console.log('There was a connection error of some sort');
    };

    request.send();

  } else {
    console.log('done')
  }
}


function writeFile(obj) {
  console.log('writing'+ ' /raw-station-data/line'+lines[lineCount]+'.json');
  jsonfile.writeFileSync(__dirname + '/raw-station-data/line'+lines[lineCount]+'.json', obj);
}


makeCall();
