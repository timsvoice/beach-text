import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import { ValidatedMethod } from 'meteor/mdg:validated-method';

export const findBeach = new ValidatedMethod({
  name: 'find.beach',
  validate: null,
  run({ searchText }) {
    const text = searchText.replace(/ /g, '+');
    // setup query
    const key = Meteor.settings.GOOGLE_KEY;
    const url = 'https://maps.googleapis.com/maps/api/place/textsearch/json?';
    const query = `query=${text}&key=${key}`;
    // create query and parse results
    const beaches = HTTP.get(url + query);
    const beachArray = [];

    beaches.forEach((result) => {
      if (beachArray.length > 3) return;

      beachArray.push({
        name: result.name,
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
      });
    });
    return beachArray;
  },
});
