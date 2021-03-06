import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { _ } from 'underscore';

import twilio from 'twilio';

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
