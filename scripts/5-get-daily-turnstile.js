'use strict';

var fs = require('fs');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var key = require('./key').key;
var jsonfile = require('jsonfile');
var newJsonWithUsageData = {};
var missedStation = {};

var dates = require('./params').dates;
var dateCount = dates.length-1;
var contour = 30;

var requestFrequency = require('./params').requestFrequency;

function readJson () {
  fs.readFile(__dirname + '/stations-inside-'+contour+'min/total.json', function(err, data) {
    var stationData = JSON.parse(data).stations;
    makeCall(stationData);
  });
}


function makeCall(stationData) {
  if(dateCount > -1) {
    var request = new XMLHttpRequest();

    var stationListWithUsage = [];
    var url ='http://openapi.seoul.go.kr:8088/'+key+'/json/CardSubwayStatsNew/1/600/'+dates[dateCount];

    console.log(url);
    request.open('GET', url, true);

    request.onload = function() {
      if (request.status >= 200 && request.status < 400) {
        // Success!

        var data = request.responseText;
          var result = JSON.parse(data);
          for(const stationUse of result.CardSubwayStatsNew.row) {

            var entriesFromCall = stationUse.RIDE_PASGR_NUM;
            var exitsFromCall = stationUse.ALIGHT_PASGR_NUM;


            var lineNum = stationUse.LINE_NUM;
            var stationNM = stationUse.SUB_STA_NM;

            // Station names from turnstile data are slightly different
            // from the one that I used to scrape station data
            //  ex. 서울역 / 서울, 광화문(세종문화회관) / 광화문
            if(stationNM.indexOf('(') > -1)  {
              stationNM = stationNM.substring(0, stationNM.indexOf('('));
            }

            if(stationUse.SUB_STA_NM === '서울역') stationNM = '서울';


            if (entriesFromCall && exitsFromCall) {
              for(const station of stationData) {
                if (station.station_name === stationNM && station.line_num == lineNum[0]) {
                  var newStationData = station;
                  newStationData.entries = entriesFromCall;
                  newStationData.exits = exitsFromCall;
                  stationListWithUsage.push(newStationData);
                }
              }
            }
          }

        newJsonWithUsageData.stations = stationListWithUsage;
        newJsonWithUsageData.date = dates[dateCount];
        writeFile(newJsonWithUsageData);
        dateCount--;
        setTimeout(readJson, requestFrequency);
      }
    }

    request.onerror = function() {
      console.log('There was a connection error of some sort');
    };

    request.send();
  } else {
    console.log('done!');
  }
}

function writeFile(obj) {
  console.log('write file' + __dirname + '/turnstile-data/'+contour+'min/'+dates[dateCount]+'.json');
  jsonfile.writeFileSync(__dirname + '/turnstile-data/'+contour+'min/'+dates[dateCount]+'.json', obj);
}


readJson();