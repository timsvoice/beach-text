import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import Future from 'fibers/future';

import Forecast from 'forecast.io';
import moment from 'moment';

const options = { APIKey: Meteor.settings.FORECAST_KEY };
const forecast = new Forecast(options);
const future = new Future();

export const getForecast = new ValidatedMethod({
  name: 'forecast.get',
  validate: null,
  run({ lat, lng }) {
    const forecastOptions = { exclude: 'minutely,flags,alerts' };
    forecast.get(lat, lng, forecastOptions, (err, res, data) => {
      if (err) future.return(err);
      console.log(data);
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
    const hourlyData = data.hourly.data;
    let dailyForecast = { };

    dailyData.forEach((daily) => {
      let dayName = moment.unix(daily.time).format('dddd').toLowerCase();
      if (day == dayName) {        
        dailyForecast = daily;
      }
    })

    const beachForecast = {
      icon: dailyForecast.icon,
      summary: dailyForecast.summary,
      temperature: { min: dailyForecast.apparentTemperatureMin, max: dailyForecast.apparentTemperatureMax },
      cloudCover: dailyForecast.cloudCover,
      precipProbability: dailyForecast.precipProbability,
    };

    return beachForecast;
  },
});
