import { Meteor } from 'meteor/meteor';
import { chai, assert } from 'meteor/practicalmeteor:chai';
import sinon from 'sinon';
import faker from 'faker';

import { messageSend } from './methods.js';

describe('sending a text message', function () {
  let message,
      messenger,
      text;

  beforeEach(function() {
    message = faker.lorem.sentence();
    messenger = sinon.stub();
    messenger.withArgs(message).returns({
      body: message      
    })
    messenger.withArgs().throws();
  })

  it('sends a text message when given a text body', function() {
    text = messenger(message);
    assert.equal(text.body, message);
  });
})