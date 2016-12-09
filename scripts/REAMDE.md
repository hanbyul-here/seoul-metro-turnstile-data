본 폴더 안의 스크립트는 박근혜 대통령 퇴진 촉구 촛불집회 이후의 지하철 이용 통계를 얻기 위해 이용되었습니다. 본 폴더 내의 스크립트는 [Node.js](https://nodejs.org/en/)에 대한 이해를 전제로 합니다.

### 선행조건

- [서울열린광장](http://data.seoul.go.kr/)에서 발급받은 API key
    본 스크립트는 사용자가 `scripts` 폴더 내에 `key.js` 파일을 만들고 다음과 같은 내용을 입력했다는 전제로 합니다.

    ```
    module.exports = {
      key: '발급받은apikey'
    }
    ```

- npm dependency 설치 (`npm install`)

### 각 스크립트가 하는 일과 실행 순서

각각의 스크립트는 커맨드라인에 `node script-name`을 입력하여 실행시킬 수 있습니다. ex. `node script/1.get-stations.js`

1. `1-get-stations.js` 서울시 지하철역 데이터를 가져옵니다.
2. `2-get-locations.js` 1에서 가져온 데이터에 위치 정보를 더합니다.
3. `3-find-near-stations.js` 2에서 가져온 데이터 중 광화문에 가까운 역들을 골라냅니다.
4. `4-merge-station-data.js` 3의 부산물인 호선별로 나누어져있는 데이터를 하나로 합칩니다.
5. `5-get-daily-sturnstile.js` 3에서 분류된 역들의 일일 사용량을 가져옵니다.
6. `6-get-final-data.js`4의 데이터를 합쳐 최종적으로 사용될 데이터를 만듭니다.

