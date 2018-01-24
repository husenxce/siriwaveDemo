let express = require('express');
let path = require('path');
let app = express();

// Define the port to run on
app.set('port', process.env.PORT||8000);

app.use(express.static(path.join(__dirname, '')));

// Listen for requests
let server = app.listen(app.get('port'), function() {
  let port = server.address().port;
});