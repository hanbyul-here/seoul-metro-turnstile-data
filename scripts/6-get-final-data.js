'use strict';

var fs = require('fs');
var jsonfile = require('jsonfile');

var dates = require('./params').dates;
var contour = 30;
var dateCount = dates.length-1;


var total = [];

function readJson () {
  if (dateCount > -1) {
    fs.readFile(__dirname + '/turnstile-data/'+contour+'min/'+dates[dateCount]+'.json', function(err, data) {

      var subwayData = JSON.parse(data);
      var newObj = {};
      var intEntry = 0;
      var intExit = 0;
      var totalEntries = 0;
      var totalExits = 0;
    // var nearStationList = [];
      for (const station of subwayData.stations) {
        totalEntries += parseInt(station.entries);
        totalExits += parseInt(station.exits);
      }

      newObj.date = subwayData.date;
      newObj.stations = subwayData.stations;
      newObj.totalEntries = totalEntries;
      newObj.totalExits = totalExits;
      total.push(newObj);

      dateCount--;

      setTimeout(readJson, 1000);
    });

  } else {
    writeFile(total, 'date-based');
    makeStationBasedData(total);

  }

}

function makeStationBasedData(data) {
  var newData = [];
  var totalData = {
    station_name: 'total',
    dates: [],
    line_num: '',
    lat: '',
    lon: ''
  };

  for (var st of data[0].stations) {
    const obj = {
        station_name: st.station_name,
        line_num: st.line_num,
        lat: st.lat,
        lon: st.lon,
        transfer_line: [],
        dates: [],
        station_cd: st.station_cd
    };

      for (var datum of data) {
        for (var station of datum.stations) {
          if(station.station_name === obj.station_name && station.line_num === obj.line_num) {
            obj['dates'].push({
              date: datum.date,
              turnstile_data: [{
                entries: station.entries,
                exits: station.exits
              }]
            });
          } else if(obj.station_name === station.station_name){
            if (obj.transfer_line.indexOf(station.line_num) < 0) obj.transfer_line.push(station.line_num);
          }
        }

        totalData['dates'].push({
          date: datum.date,
          turnstile_data: [{
            entries: datum.totalEntries,
            exits: datum.totalExits
          }]
        })
      }

      newData.push(obj);

  }

  const originData = newData;

  originData.push(totalData);
  writeFile(originData, 'station-based');

  originData.pop();
  var mergedData = mergeStation(originData);
  writeFile(mergedData, 'station-merged');

  return originData;
}

function mergeStation (data) {

  var mingledData = [];
  var pushedData = [];
  var originalData = data;

  for(const currentStation of originalData) {
    const newObj = {
        station_name: currentStation.station_name,
        line_num: currentStation.line_num,
        lat: currentStation.lat,
        lon: currentStation.lon,
        dates: [],
        transfer_line: currentStation.transfer_line,
        station_cd: currentStation.station_cd
    }
    for(var i = 0; i<currentStation.dates.length; i++) {
      var dateObj = Object.assign({}, currentStation.dates[i]);
      newObj.dates.push(dateObj);
    }
    const sames = findSameStations(newObj, data);

    for(const oneStation of sames) {
      console.log('before    : '+newObj.dates[2].turnstile_data[0].exits);
      for(let i = 0; i < newObj.dates.length; i++) {
        const currentEntries = oneStation.dates[i].turnstile_data[0].entries;
        const currentExits = oneStation.dates[i].turnstile_data[0].exits;

        newObj.dates[i].turnstile_data[0].entries += currentEntries;
        newObj.dates[i].turnstile_data[0].exits += currentExits;
      }
      console.log('after     : ' +newObj.dates[2].turnstile_data[0].exits)
    }

    if(pushedData.indexOf(newObj.station_name) < 0) {
      mingledData.push(newObj);
      pushedData.push(newObj.station_name);
    }
  }

  return mingledData;

}

function findSameStations(obj, data) {
  const sameStations = [];
  for(const station of data) {
    if(station.station_name === obj.station_name && station.line_num !== obj.line_num) {
      sameStations.push(station);
    }
  }
  return sameStations;
}

// function findObj(element, index, array) {
//   for(const elem in array) {
//     if(elem.station_name === element.station_name && elem.line_num !== element.line_num) {

//     }
//   }
// }


function writeFile(obj, fileName) {
  console.log('write ' + fileName +' file');
  jsonfile.writeFileSync(__dirname + '/turnstile-data/'+contour+'min/trimmed-'+ fileName + dates[0]+'-'+dates[dates.length-1] + '.json', obj);
}

readJson();