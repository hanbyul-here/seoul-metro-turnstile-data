var GeoJSON = require('geojson');
var fs = require('fs');
var jsonfile = require('jsonfile');

var lineNum;

fs.readFile(__dirname + '/turnstile-data/30min/trimmed-station-merged20161029-20161217.json', function(err, data) {
  fs.readFile(__dirname + '/turnstile-data/30min/trimmed-station-merged20151107-20151226.json', function(err, oldData) {
    lineNum = JSON.parse(data).line;
    console.log("hi!")
    var oldStations = JSON.parse(oldData);
    var stationData = JSON.parse(data);

    for(const station of stationData) {
      for(const oldStation of oldStations) {
        if (station.station_cd == oldStation.station_cd) {
          station.previous_data = oldStation.dates;
        }
      }
    }


    // get all Key names
    let keyNames = [];
    const oneExample = stationData[0];
    for (var keyName in oneExample) {
      if ( keyName != 'lat' || keyName != 'lon') {
        keyNames.push(keyName);
      }
    }

    var lineGeoJson = GeoJSON.parse(stationData, {Point: ['lat', 'lon'], include: keyNames});

    writeStationFile(lineGeoJson);
  });
});


function writeStationFile(obj) {
  obj.line = lineNum;
  console.log("writing geojson")
  jsonfile.writeFileSync(__dirname + '/../examples/assets/lets-see.geojson', obj);
}
