# sennen-test-solution

A simple express api that retrieves sunset/sunrise data for 100 random latitudes and longitudes and returns the earliest sunrise from among those coordinates and the length of the day for that place.

## Install
`npm run install`

## Test
`npm run test`

## Build and Start
`npm run start`

## Usage
Go to `http://localhost:3001/getEarliestSunrise` using Postman or use curl:

`curl --header "Content-Type: application/json" \
  --request GET \
  http://localhost:3001/getEarliestSunrise
`