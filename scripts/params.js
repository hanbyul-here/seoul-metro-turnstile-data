module.exports = {
  // A: 공항철도, B: 분당선, G: 경춘선, K: 경의중앙선, S: 신분당선, SU: 수인선
  lines: ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'G', 'K', 'S', 'SU'],
  dates: ['20161029', '20161105', '20161112', '20161119', '20161126', '20161203',  '20161210', '20161217'],
  travelTime: '30',
  requestFrequency: 200  // time gap between requests to openAPI.seoul.go.kr:8080
}