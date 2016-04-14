import VeRex from 'verbal-expressions';

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
  const knowNumbers = [];
  if (knowNumbers.indexOf(From)) return true;
  return false;
};

export const dayChecker = ({ Body }) => {
  // define an array of possible days
  let requestedDay = '';
  days.forEach((day) => {
    const dayMatch = verex().find(day);
    if (dayMatch.test(Body)) requestedDay = day;
  });

  if (requestedDay.length < 1) return false;
  return requestedDay;
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

export const responseGenerator = ({ apparentTemperature, icon }) => {
  // check apparentTemperature
  const yahConditions = ['clear-day', 'clear-night', 'partly-cloudy-night'];
  const mehConditions = ['wind', 'fog', 'cloudy', 'partly-cloudy-day'];
  const nahConditions = ['rain', 'snow', 'sleet'];
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

  return response(apparentTemperature);
};
