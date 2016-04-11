import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import twilio from 'twilio';
import { find } from '../location/methods.js';

const messenger = twilio(Meteor.settings.TWILIO_ACCOUNT_SID, Meteor.settings.TWILIO_AUTH_TOKEN);
const twilioNumber = Meteor.settings.TWILIO_NUMBER;

export const send = new ValidatedMethod({
  name: 'messenger.send',
  validate: new SimpleSchema({
    message: { type: String },
    recipient: { type: String },
  }).validator(),
  run({ message, recipient }) {
    // call to twilio api to send a message
    const text = Meteor.wrapAsync(messenger.sendMessage);
    const textResult = text({
      to: recipient,
      from: twilioNumber,
      body: message,
    });
    return textResult;
  },
});

export const findBeach = new ValidatedMethod({
  name: 'messenger.find.beach',
  validate: new SimpleSchema({
    searchText: { type: String },
  }).validator(),
  run({ searchText, messageData }) {
    const beaches = find.call({ searchText });
    const beachText = '';
    let response = {};

    // set the response message based on
    // search results
    switch (beaches.length) {
      case 0: {
        response = {
          beaches: beaches.length,
          status: 'failed',
          message: 'hmmm. I couldn\'t find your beach. got any other ideas',
        };
        break;
      }
      case 1: {
        response = {
          beaches: beaches.length,
          status: 'success',
          message: 'got one. want me to add ',
        };
        break;
      }
      default: {
        response = {
          beaches: beaches.length,
          status: 'success',
          message: 'cool. I found a few. any of these work: ',
        };
        break;
      }
    }

    // create a numbered string of beaches
    if (response.status === 'success') {
      beaches.forEach((beach, index) => {
        beachText.concat(`#${index + 1} ${beach.name} `);
      });
    }

    // create final message to send
    response.message.concat(beachText).concat(' ?');

    // send the response to the user
    send.call({ message: response.message, reciepient: messageData.from });
  },
});
