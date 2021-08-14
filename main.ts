import express from "express";
import axios from "axios";
import * as _ from "lodash";
import moment from "moment";
const randomCoordinates = require('random-coordinates');

const port: number = 3001;
let app = express();

app.listen(port, (() => console.log(`App started on port ${port}`)));

let sunriseAPI: string = "https://api.sunrise-sunset.org/json";

interface sunriseData {
    sunrise?: string,
    dayLength?: number
}

app.get("/getSunriseData", async (request, resolve) => {
    const coordinatesList: string[] = generateRandomLatLongs(10);
    
    let requestURLs: any = [];
    
    for (const coordinates of coordinatesList) {
        const coordinatesArray = coordinates.split(", ");
        let url = `${sunriseAPI}?lat=${coordinatesArray[0]}&lng=${coordinatesArray[1]}&date=today&formatted=0`;
        requestURLs.push(url);
    }

    requestURLs = _.chunk(requestURLs, 5);

    let earliestSunriseData: sunriseData = {};

    for (const array of requestURLs) {
        console.log(array);
        await axios.all([
            axios.get(`${array[0]}`),
            axios.get(`${array[1]}`),
            axios.get(`${array[2]}`),
            axios.get(`${array[3]}`),
            axios.get(`${array[4]}`),
        ]
        ).then(
            axios.spread((...responses: any[]) => {
                for (const response of responses) {
                    if (!(earliestSunriseData.sunrise)) {
                        earliestSunriseData.sunrise = response.data.results.sunrise;
                        earliestSunriseData.dayLength = response.data.results['day_length'];
                    }
                    else if (Date.parse(response.data.results.sunrise) < Date.parse(earliestSunriseData.sunrise)) {
                        earliestSunriseData.sunrise = response.data.results.sunrise;
                        earliestSunriseData.dayLength = response.data.results['day_length'];
                    }
                    console.log(earliestSunriseData);
                }
            })
        ).catch((error) => {
            console.log(error);
        }
        )
    }

    resolve.send(`Earliest sunrise is ${moment(earliestSunriseData.sunrise).format('hh:mm:ss')} with day length ${moment.utc(earliestSunriseData.dayLength as number * 1000).format('HH:mm:ss')}`);
})

const generateRandomLatLongs = (number: number) => {
    const coordinatesList: string[] = [];
    while (coordinatesList.length < number) {
        coordinatesList.push(randomCoordinates());
    }
    return coordinatesList;
}