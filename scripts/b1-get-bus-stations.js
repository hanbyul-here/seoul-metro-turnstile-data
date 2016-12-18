'use strict';

var fs = require('fs');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var key = require('./key').key;

var jsonfile = require('jsonfile');

var stations;
var stationCount;

var busStops = [];

var requestFrequency = 200; // time gap between requests to openAPI.seoul.go.kr:8080

fs.readFile(__dirname + '/stations-inside-30min/total.json', function(err, data) {
  var result = JSON.parse(data);
  stations = result.stations;
  stationCount = result.stations.length-1;
  makeCall();
});



function makeCall() {
  if (stationCount > -1) {
    var request = new XMLHttpRequest();

    var url = 'http://openAPI.seoul.go.kr:8088/'+key+'/json/SearchBusSTNByIDService/1/100/'+stations[stationCount].station_cd;
    console.log(url);

    request.open('GET', url, true);
    request.onload = function() {
      if (request.status >= 200 && request.status < 400) {
        // Success!
        var data = JSON.parse(request.responseText);
        if (data.SearchBusSTNByIDService) {
          for(const stop of data.SearchBusSTNByIDService.row) {
            busStops.push(stop);
          }
        }
      } else {
        console.log('We reached our target server, but it returned an error')
      }
      stationCount--;
      setTimeout(makeCall, requestFrequency);
    }

    request.onerror = function() {
      console.log('There was a connection error of some sort');
    };

    request.send();

  } else {
    writeFile(busStops);
    console.log('done')
  }
}


function writeFile(obj) {
  console.log('writing'+ ' /bus-stop/total-stops-near.json');
  jsonfile.writeFileSync(__dirname + '/bus-stops/total.json', obj);
}

