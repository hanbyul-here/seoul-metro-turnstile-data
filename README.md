## 서울 지하철 승객 데이터

박근혜 대통령 퇴진 촉구 촛불집회 관련 지하철 이용 통계 [기사](http://www.huffingtonpost.kr/2016/11/13/story_n_12936242.html)에 아쉬움을 느껴 [서울 열린데이터 광장](http://data.seoul.go.kr/)에 열람되어있는 데이터를 이용하여 광화문광장 근처의 지하철역 승객 데이터를 모아보았습니다.

사용한 API는 대략 다음과 같습니다.

- [서울시 노선별 지하철역 정보](http://data.seoul.go.kr/openinf/sheetview.jsp?infId=OA-119)
- [서울시 역코드로 지하철역 위치 조회](http://data.seoul.go.kr/openinf/openapiview.jsp?infId=OA-118)
- [서울시 지하철호선별 역별 승하차 정보](http://data.seoul.go.kr/openinf/openapiview.jsp?infId=OA-12914)
- [Mapzen Isochrone](https://mapzen.com/documentation/mobility/explorer/overview/)

위의 데이터를 이용하여 [서울시 지하철역 위치 정보](https://gist.github.com/hanbyul-here/c1ecc399372220bff0642f696f383cf9)와 일일 이용객 정보를 알 수 있었고, 이후 Mapzen Isochrone(예상되는 여행시간에 따른 구획) 서비스를 이용하여 [광화문 광장으로부터 도보로 15분, 30분 거리의 역들을](https://mapzen.com/mobility/explorer/#/isochrones?bbox=126.92856788635252%2C37.553151554955924%2C127.02744483947754%2C37.59675599538423&isochrone_mode=pedestrian&pin=37.57497%2C126.977978) 추려내어 다음과 같은 데이터를 얻을 수 있었습니다.

- 광화문 광장으로부터 도보 15분 거리 내 지하철역 이용객 데이터
- 광화문 광장으로부터 도보 30분 거리 내 지하철역 이용객 데이터

각각의 데이터는 **10월 15일(촛불집회 시작 2주 전)부터 11월 26일** 까지 매주 토요일의 데이터를 가지고 있습니다. 서울시 열린데이터 광장 역별 승하차 정보가 업데이트되는대로 리포의 데이터도 업데이트될 예정입니다. (지하철 승하차 정보는 매일 9일전 데이터를 적재합니다.)

최종 데이터는 `data` 폴더에서, 데이터를 모으기위해 사용한 스크립트와 데이터는 `scripts` 폴더에서, 데이터를 활용한 예시는 `examples` 폴더에서 찾을 수 있습니다.

본 리포의 [깃헙 페이지](https://hanbyul-here.github.io/seoul-metro-turnstile-data/)에서 각 데이터 테이블을 확인할 수 있습니다.
본 리포의 데이터는 [MIT 라이센스](https://ko.wikipedia.org/wiki/MIT_%ED%97%88%EA%B0%80%EC%84%9C)를 따릅니다.

## Seoul Metro Turnstile Data

[South Korea is seeing a series of big protests against President Park Geun-hye.](http://www.nytimes.com/2016/11/26/world/asia/korea-park-geun-hye-protests.html?_r=0) Protests are happening on every Saturday after 15th Oct, in central Seoul. 2016 The data of this repo was collected from [Seoul Open Data Plaza](http://data.seoul.go.kr/) in a hope to better understand the attendance statistics of the protest.

APIs used for this project:

- [Seoul Metro Station Information](http://data.seoul.go.kr/openinf/sheetview.jsp?infId=OA-119)
- [Seoul Metro Station Geolocation](http://data.seoul.go.kr/openinf/openapiview.jsp?infId=OA-118)
- [Seoul Metro Turnstile Data](http://data.seoul.go.kr/openinf/openapiview.jsp?infId=OA-12914)
- [Mapzen Isochrone](https://mapzen.com/documentation/mobility/explorer/overview/)

Data you can find:

- Turnstile Data of Metro Stations within 15 mins walk from Gwang-Hwa-Moon Plaza, where protests happen.
- Turnstile Data of Metro Stations within 30 mins walk from Gwang-Hwa-Moon Plaza

You can also check out the data on [gh-pages](https://hanbyul-here/github.io/seoul-metro-turnstile-data).

The data of the repo follows (MIT License)[https://opensource.org/licenses/MIT].
