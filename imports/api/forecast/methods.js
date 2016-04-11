import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';

import Forecast from 'forecast.io';

const options = { APIKey: Meteor.settings.FORECAST_KEY };

const forecast = new Forecast(options);

export const getForecast = new ValidatedMethod({
  name: 'forecast.get',
  validate: null,
  run({ lat, lng }) {
    const forecastCall = Meteor.wrapAsync(forecast.get, forecast);
    const forecastOptions = { exclude: 'minutely,daily,hourly,flags,alerts' };
    const forecastResult = forecastCall(lat, lng, forecastOptions);
    return forecastResult;
  },
});
