const MongoClient = require('mongodb').MongoClient
 
module.exports = async function() {
  return MongoClient.connect('mongodb://localhost:27017', { useUnifiedTopology: true }).then(client => client.db('veilance'))
}