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
    const beaches = HTTP.get(url + query).data.results;

    const beachArray = [];
    beaches.forEach((result) => {
      if (beachArray.length >= 1) return;

      beachArray.push({
        name: result.name,
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
      });
    });
    return beachArray;
  },
});

export const beachSelect = new ValidatedMethod({
  name: 'messenger.select.beach',
  validate: null,
  run({ searchText }) {
    const beaches = Meteor.call('find.beach', { searchText });
    console.log('beaches', beaches.length);
    let beachText = '';
    let response = {};

    // set the response message based on
    // search results
    switch (beaches.length) {
      case 0: {
        response = {
          beaches: beaches[0],
          status: 'failed',
          message: 'Hmmm. I couldn\'t find your beach. Got any other ideas?',
        };
        break;
      }
      case 1: {
        response = {
          beaches: beaches[0],
          status: 'success',
          message: `Cool. I found ${beaches[0].name}. When are you going?`,
        };
        break;
      }
      default: {
        response = {
          beaches: beaches[0],
          status: 'failed',
          message: 'Hmmm. I couldn\'t find your beach. Got any other ideas?',
        };
        break;
      }
    }
    // create an array of beaches
    const beachNamesArray = [];
    beaches.forEach((beach, index) => {
      beachNamesArray.push(beach.name);
    });      
    const beachNames = beachNamesArray.join(', ');

    // create final message to send
    let finalMessage = {
      text: _.escape(response.message),
      beaches: response.beaches,
    }    
    return finalMessage;
  },
});