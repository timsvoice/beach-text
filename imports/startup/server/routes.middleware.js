import VeRex from 'verbal-expressions';
import moment from 'moment';
import { Peeps } from '../../api/peeps/peeps.js';

const verex = VeRex;

// Middleware designed for Picker server side routing
const days = [
  'now',
  'later',
  'today',
  'tomorrow',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

export const knownNumber = ({ From }) => {
  let knowNumbers = Peeps.findOne({ number: From });
  if (knowNumbers) return true;
  return false;
};

export const beachMatch = ({ Body, From }) => {
  let response = verex().find('yes').or('yup').or('yah');
  const beachMatchResponse = response.test(Body);
  return beachMatchResponse;
};

export const dayChecker = ({ Body, From }) => {
  // define an array of possible days
  let requestedDay = '';
  days.forEach((day) => {
    const dayRequest = Body.toLowerCase();
    const dayMatch = verex().find(day);
    console.log(day);
    if (dayMatch.test(dayRequest)) {
      switch (dayRequest) {
        case 'today':           
          requestedDay = moment().format('dddd');
          break;
        case 'tomorrow':
          requestedDay = moment().add(1, 'days').format('dddd');
          break;
        case 'later':
          requestedDay = moment().format('dddd');
          break;
        case 'now':
          requestedDay = moment().format('dddd');
          break;
        default:
          requestedDay = day;
      }
    }
  });

  if (requestedDay.length < 1) return false;
  return requestedDay.toLowerCase();
};

export const shortcode = ({ Body }) => {
  // check body against regex of anticipated form
  const shortcodeMatch = verex().find('beach day').or('beachday');
  const isShortcode = shortcodeMatch.test(Body);
  // check for day requested
  const day = dayChecker({ Body });
  if (!isShortcode || !day) {
    return false;
  }
  return { isShortcode, day };
};

export const responseGenerator = ({ apparentTemperature, icon, summary }) => {
  // check apparentTemperature
  const yahConditions = ['clear-day', 'clear-night', 'partly-cloudy-night'];
  const mehConditions = ['wind', 'cloudy', 'partly-cloudy-day'];
  const nahConditions = ['rain', 'snow', 'sleet', 'fog'];
  const allConditions = yahConditions.concat(mehConditions.concat(nahConditions));

  const mehWeather = mehConditions.indexOf(icon) !== -1;
  const nahWeather = nahConditions.indexOf(icon) !== -1;

  if (allConditions.indexOf(icon) === -1) return 'condition not found';

  const response = (temp) => {
    if (temp <= 65) {
      return 'nah';
    } else if (temp > 66 && temp <= 73) {
      if (nahWeather) return 'nah';
      return 'meh';
    } else if (temp > 74) {
      if (nahWeather) return 'nah';
      else if (mehWeather) return 'meh';
      return 'yah';
    }
    return 'nah';
  };

  switch (response(apparentTemperature)) {
    case 'nah':
      let responseMessage = `Nah, better sit this one out. It's going to be ${summary} It\'s going to feel like ${apparentTemperature.min}. Watch a movie or something`
      break;
    case 'meh':
      responseMessage = `Meh, not so good. It's going to be ${summary} It\'s going to feel like ${apparentTemperature.min}`
      break;
    case 'yah':
      responseMessage = `Yah, it\'s going to be an awesome beach day! It's going to be ${summary} It\'s going to feel like ${apparentTemperature.max} Get out there`
      break;
    default:
      responseMessage = `Nah, better sit this one out. It's going to be ${summary} It\'s going to feel like ${apparentTemperature.min}. Watch a movie or something`
      break;
  }

  return responseMessage
};
