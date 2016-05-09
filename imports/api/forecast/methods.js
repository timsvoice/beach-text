import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import Future from 'fibers/future';

import Forecast from 'forecast.io';

const options = { APIKey: Meteor.settings.FORECAST_KEY };
const forecast = new Forecast(options);
const future = new Future();

export const getForecast = new ValidatedMethod({
  name: 'forecast.get',
  validate: null,
  run({ lat, lng }) {
    const forecastOptions = { exclude: 'minutely,hourly,flags,alerts' };
    forecast.get(lat, lng, forecastOptions, (err, res, data) => {
      if (err) future.return(err);
      future.return(data);
    });
    return future.wait();
  },
});

export const getBeachForecast = new ValidatedMethod({
  name: 'forecast.beach',
  validate: null,
  run({ day, lat, lng }) {
    const data = getForecast.call({ lat, lng });
    const dailyData = data.daily.data;

    const data = dailyData.forEach((daily) => {
      dayName = moment(daily.time).format('dddd').toLowerCase()
      if (day === dayName) {
        return daily;
      }
    })

    const beachForecast = {
      summary: hourlyData.summary,
      current: currentData.summary,
      temperature: currentData.apparentTemperature,
      cloudCover: currentData.cloudCover,
      precipProbability: currentData.precipProbability,
    };
    return beachForecast;
  },
});
