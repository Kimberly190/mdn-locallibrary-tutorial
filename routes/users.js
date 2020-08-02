var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

/* Challenge Yourself:
Create a new route in /routes/users.js that will display the text "You're so cool"
at URL /users/cool/. Test it by running the server and visiting
http://localhost:3000/users/cool/ in your browser */
// router.get('/cool/', function(req, res, next) {
//   res.send('you\'re so cool');
// })

module.exports = router;
