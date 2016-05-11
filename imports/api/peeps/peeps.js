import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

export const Peeps = new Mongo.Collection('Peeps');

// Deny all client-side updates since we will be using methods to manage this collection
Peeps.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});

Peeps.schema = new SimpleSchema({
  'number': {
    type: String,
    unique: true    
  },
  'first_name': {
    type: String,
    optional: true,
  },
  'last_name': {
    type: String,
    optional: true,
  },
  'request': {
    type: Object,
    defaultValue: { next_message: '' },
  },
  'request.beach': {
    type: Object,    
  },
  'request.beach.lat': {
    type: String,
    optional: true,
  },
  'request.beach.lng': {
    type: String,
    optional: true,
  },
  'request.beach.name': {
    type: String,
    optional: true,
  },
  'request.next_message': {
    type: String,
    defaultValue: '',
  },  
})