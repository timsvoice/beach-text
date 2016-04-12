import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import twilio from 'twilio';
import { findBeach } from '../location/methods.js';

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

export const beachSelect = new ValidatedMethod({
  name: 'messenger.select.beach',
  validate: null,
  run({ searchText, messageData }) {
    const beaches = findBeach.call({ searchText });
    let beachText = '';
    let response = {};

    // set the response message based on
    // search results
    switch (beaches.length) {
      case 0: {
        response = {
          beaches: beaches.length,
          status: 'failed',
          message: 'Hmmm. I couldn\'t find your beach. Got any other ideas',
        };
        break;
      }
      case 1: {
        response = {
          beaches: beaches.length,
          status: 'success',
          message: 'Got one. Want me to add ',
        };
        break;
      }
      default: {
        response = {
          beaches: beaches.length,
          status: 'success',
          message: 'Cool. I found a few. Any of these work: ',
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
    let finalMessage = response.message.concat(beachNames).concat('?');  
    // send the response to the user
    send.call({ message: finalMessage, recipient: messageData.from });
  },
});