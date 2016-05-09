import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { _ } from 'underscore';
import { Peeps } from './peeps.js';

export const addBeach = new ValidatedMethod({
  name: 'add.beach',
  validate: null,
  run({ number, lat, lng, name }) {
    Peeps.update({ number: number}, {
      $set: {
        beach: { lat, lng, name }
      }
    });
  }
});

export const updateName = new ValidatedMethod({
  name: 'update.number',
  validate: null,
  run({ number, firstName, lastName }) {
    Peeps.update({ number: number}, {
      $set: {
        first_name: firstName,
        last_name: lastName
      }
    });
  }
});

export const updateMessage = new ValidatedMethod({
  name: 'update.message',
  validate: null,
  run({ number, message }) {
    Peeps.update({ number: number }, {
      $set: {
        next_message: message
      }
    })
  }
});
