var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
    "nom": String,
    "prenom": String,
    "contact_mail": String,
    "id_particle": String
});

var User = mongoose.model('users', userSchema);

module.exports = User;
