import { _ } from 'underscore';
import { beachSelect } from '../../api/location/methods.js';
import { knownNumber, beachMatch, dayChecker, shortCode, responseGenerator } from './routes.middleware.js';
import { Peeps } from '../../api/peeps/peeps.js';
import { updateName, updateMessage, addBeach } from '../../api/peeps/methods.js';
import { getBeachForecast } from '../../api/forecast/methods.js';

Picker.route( '/api/welcome', function( params, request, response, next ) {    
  let query = params.query;
  let url = '/api/welcome/message';

  if (!knownNumber( {From: query.From} )) {
    Peeps.insert({ number: query.From, request: { next_message: '' } });    
  } else {
    let peep = Peeps.findOne({ number:query.From });
    switch (peep.request.next_message) {
      case '':
        url = '/api/welcome/message';
        break;      
      case 'welcome-message':
        url = '/api/welcome/message';
        break
      case 'beach-find':
        url = '/api/beach/find';
        break
      case 'beach-match':
        url = '/api/beach/match';
        break;
      case 'beach-day':
        url = '/api/beach/day';
        break;
      case 'beach-recommendation':
        url = '/api/beach/recommendation';
        break;
      default:
        url = '/api/welcome/message';
        break;
    }
  }

  response.writeHead('301', { Location: 'http://' + request.headers.host + url });
  response.end();

});

Picker.route('/api/welcome/message', function ( params, request, response, next ) {
  let query = params.query;
  updateMessage.call({ number: query.From, message: 'beach-find' });
  let body = `<?xml version="1.0" encoding="UTF-8" ?><Response><Message>Yo, which beach are you going to?</Message></Response>`;
  // set last_message = welcome-name  
  response.writeHead(200, {
  'Content-Length': body.length,
  'Content-Type': 'text/xml' });
  response.write(body);
})

Picker.route('/api/beach/find', function ( params, request, response, next ) {
  let query = params.query;

  let beachResponse = Meteor.call('messenger.select.beach', { searchText: query.Body });
  if (beachResponse != 0) {
    updateMessage.call({number: query.From, message: 'beach-day'});
    addBeach.call({number: query.From, lat: beachResponse.beaches.lat, lng: beachResponse.beaches.lng, name: beachResponse.beaches.name });
  }
  let body = `<?xml version="1.0" encoding="UTF-8" ?><Response><Message>${beachResponse.text}</Message></Response>`;
  if (beachResponse.beaches > 1) {
    let url = '/api/beach/find/picker';
    response.writeHead('301', { Location: 'http://' + request.headers.host + url });
    response.end();
  } else {
    response.writeHead(200, {
    'Content-Length': body.length,
    'Content-Type': 'text/xml' });
    response.write(body);
  }
})

Picker.route('/api/beach/day', function ( params, request, response, next ) {
  let query = params.query;
  let day = dayChecker({ Body: query.Body, From: query.From });
  let peep = Peeps.findOne({ number:query.From });
  
  let forecast = getBeachForecast.call({ day: day, lat:peep.beach.lat, lng:peep.beach.lng });
  let recommendation = responseGenerator({ apparentTemperature: forecast.temperature, icon: forecast.icon, summary: forecast.summary });  

  let body = `<?xml version="1.0" encoding="UTF-8" ?><Response><Message>${recommendation}</Message></Response>`;
  // set last_message = welcome-name  
  response.writeHead(200, {
  'Content-Length': body.length,
  'Content-Type': 'text/xml' });
  response.write(body);
  updateMessage.call({ number: query.From, message: 'welcome-message' });
});


// Picker.route('/api/beach/match', function ( params, request, response, next ) {
//   Meteor.call('update.message', { number: params.From, message: 'beach-day' });
//   let query = params.query; 
//   let beach = beachMatch.call({Body: query.Body, From: query.From });
//   let body = `<?xml version="1.0" encoding="UTF-8" ?><Response><Message>${beachResponse.text}</Message></Response>`;
//   if (beachResponse.beaches > 1) {
//     let url = '/api/beach/find/picker';
//     response.writeHead('301', { Location: 'http://' + request.headers.host + url });
//     response.end();
//   } else {
//     response.writeHead(200, {
//     'Content-Length': body.length,
//     'Content-Type': 'text/xml' });
//     response.write(body);
//   }
// })

// Picker.route('/api/beach/find/picker', function ( params, request, response, next ) {
//   Meteor.call('update.message', {number: params.From, message: 'beach-find-picker'});
//   let query = params.query; 
//   let beachResponse = dayChecker.call({ Body:query.Body, messageData: { from: query.From }});
//   let body = `<?xml version="1.0" encoding="UTF-8" ?><Response><Message>${beachResponse}</Message></Response>`;

//   response.writeHead(200, {
//   'Content-Length': body.length,
//   'Content-Type': 'text/xml' });
//   response.write(body);
// })
// // The app needs to track where in the question series you are

// Picker.route( '/api/beach/day', function( params, request, response, next ) {    
//   let query = params.query;  
//   let dayResponse = dayChecker.call({ Body:query.Body, From: query.From });  
//   let url = '/api/beach/recommendation';

//   params.query.day = dayResponse;

//   response.writeHead('301', { Location: 'http://' + request.headers.host + url });
//   response.end();
// });

// Picker.route( '/api/beach/recommendation', function( params, request, response, next ) {    
//   Meteor.call('update.message', {number: params.From, message: ''});
//   let query = params.query;  
//   let beachResponse = beachSelect.call({searchText:query.Body, messageData: { from: query.From }});
//   let body = `<?xml version="1.0" encoding="UTF-8" ?><Response><Message>recommendation</Message></Response>`;

//   response.writeHead(200, {
//   'Content-Length': body.length,
//   'Content-Type': 'text/xml' });
//   console.log(body);
//   response.write(body);
// });

// Picker.route( '/api/error', function( params, request, response, next ) {    
//   let query = params.query;  
//   let beachResponse = beachSelect.call({searchText:query.Body, messageData: { from: query.From }});
//   let body = `<?xml version="1.0" encoding="UTF-8" ?><Response><Message>recommendation</Message></Response>`;

//   response.writeHead(200, {
//   'Content-Length': body.length,
//   'Content-Type': 'text/xml' });
//   console.log(body);
//   response.write(body);
// });

// Picker.route( '/api/beach/shortcut', function( params, request, response, next ) {    
//   let query = params.query;  
//   let beachResponse = beachSelect.call({searchText:query.Body, messageData: { from: query.From }});
//   let body = `<?xml version="1.0" encoding="UTF-8" ?><Response><Message>recommendation</Message></Response>`;

//   response.writeHead(200, {
//   'Content-Length': body.length,
//   'Content-Type': 'text/xml' });
//   console.log(body);
//   response.write(body);
// });