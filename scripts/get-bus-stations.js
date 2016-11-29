'use strict';

var fs = require('fs');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var key = require('./key').key;

var jsonfile = require('jsonfile');

var stations;
var stationCount;

var busStops = [];

  fs.readFile(__dirname + '/stations-inside-30min/total.json', function(err, data) {
    var result = JSON.parse(data);
    stationCount = result.stations;
    makeCall();
  });



function makeCall() {
  if (stationCount > -1) {
    var request = new XMLHttpRequest();

    var url = 'http://openAPI.seoul.go.kr:8088/'+key'/xml/SearchBusSTNByIDService/1/5/'+stations.station_cd;
    console.log(url);

    request.open('GET', url, true);
    request.onload = function() {
      if (request.status >= 200 && request.status < 400) {
        // Success!
        var data = JSON.parse(request.responseText);
        writeFile(data);
        stationCount--;

        setTimeout(makeCall, 1000);
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
  console.log('writing'+ ' /raw-bus-stop-data/total.json');
  jsonfile.writeFileSync(__dirname + '/raw-bus-stop-data/total.json', obj);
}


makeCall();
