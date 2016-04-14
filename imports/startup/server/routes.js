import { _ } from 'underscore';
import { beachSelect } from '../../api/messenger/methods.js';


  const Api = new Restivus({
    useDefaultAuth: false,
    prettyJson: true
  });

Picker.route( '/feed/me/a/beach', function( params, request, response, next ) {    
  let query = params.query;  
  let beachResponse = beachSelect.call({searchText:query.Body, messageData: { from: query.From }});
  let body = `<?xml version="1.0" encoding="UTF-8" ?><Response><Message>${beachResponse}</Message></Response>`;

  response.writeHead(200, {
  'Content-Length': body.length,
  'Content-Type': 'text/xml' });
  console.log(body);
  response.write(body);
});
