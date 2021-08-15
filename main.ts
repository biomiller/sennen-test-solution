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

app.get("/getSunriseData", async (request, resolve, next) => {

    const coordinatesList: string[] = generateRandomLatLongs(10);

    let requestURLs: any = [];

    for (const coordinates of coordinatesList) {
        const coordinatesArray = coordinates.split(", ");
        let url = `${sunriseAPI}?lat=${coordinatesArray[0]}&lng=${coordinatesArray[1]}&date=today&formatted=0`;
        requestURLs.push(url);
    }

    requestURLs = _.chunk(requestURLs, 5);

    try {
        const earliestSunrise = await getEarliestSunrise(requestURLs);
        resolve.send(earliestSunrise);
    } catch (error) {
        next(error);
    }
})

const generateRandomLatLongs = (number: number) => {
    const coordinatesList: string[] = [];
    while (coordinatesList.length < number) {
        coordinatesList.push(randomCoordinates());
    }
    return coordinatesList;
}

const getEarliestSunrise = async (requestUrlBatches: string[][]) => {
    let earliestSunriseData: sunriseData = {};
    let response: string;

    for (const batch of requestUrlBatches) {
        console.log(batch);
        await axios.all([
            axios.get(`${batch[0]}`),
            axios.get(`${batch[1]}`),
            axios.get(`${batch[2]}`),
            axios.get(`${batch[3]}`),
            axios.get(`${batch[4]}`),
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
            throw new Error(error);
        }
        )
    }

    const forattedSunrise = moment(earliestSunriseData.sunrise).utc().format('HH:mm:ss');
    const formattedDayLength = moment(earliestSunriseData.dayLength as number * 1000).utc().format('HH[h]:mm[min]:ss[sec]');

    response = `Earliest sunrise is ${forattedSunrise} with day length ${formattedDayLength}`;

    return (response);
}