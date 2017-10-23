var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
    "nom": String,
    "prenom": String,
    "mail": String,
    "id_particle": String,
    "createdAt" : Date
});
// je crée un model et j'attache le schema ci dessus
var User = mongoose.model('User', userSchema);

module.exports = User;
