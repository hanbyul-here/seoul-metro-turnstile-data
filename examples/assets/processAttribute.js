var getMainColor = function() {
  var colorScheme = [
    "rgb(103, 0, 13)",
    "rgb(165, 15, 21)",
    "rgb(203, 24, 29)",
    "rgb(239, 59, 44)",
    "rgb(251, 106, 74)",
    "rgb(252, 146, 114)",
    "rgb(252, 187, 161)",
    "rgb(254, 224, 210)",
    "rgb(255, 245, 240)"];
  colorScheme.reverse();

  return colorScheme[4];
}

var getSizeByProperty = function(feature) {
  var size = 0;
  var previousSize = 0;
  for (var i = 0; i < feature.dates.length;i++) {
    size += feature.dates[i].turnstile_data[0].exits;
    previousSize += feature.previous_data[i].turnstile_data[0].exits;
  }
  size /= feature.dates.length;
  previousSize /= feature.dates.length;
  return Math.floor((Math.sqrt((size-previousSize)/10)+5));
}