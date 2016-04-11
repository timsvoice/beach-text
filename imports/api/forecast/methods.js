import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { _ } from 'underscore';

import Forecast from 'forecast.io';

const options = { APIKey: Meteor.settings.FORECAST_KEY };
const forecast = new Forecast(options);

export const getForecast = new ValidatedMethod({
  name: 'forecast.get',
  validate: null,
  run({ lat, lng }) {    
    let forecastCall = Meteor.wrapAsync(forecast.get, forecast);
    let forecastOptions = { exclude:'minutely,hourly,flags,alerts' };
    let forecastResult = forecastCall(lat, lng, forecastOptions).body;
    return forecastResult;
  },
});

export const getBeachForecast = new ValidatedMethod({
  name: 'forecast.beach',
  validate: null,
  run({ lat, lng }) {
    let forecastResult = getForecast.call({ lat, lng });
    let beachForecast = {}

    beachForecast.summary = forecastResult;
  }
})

// getBeachForecast.call({
//   lat: 10.345,
//   lng: -10.56
// })