var mongoose = require('mongoose');

var particleSchema = mongoose.Schema({
    "id_particle": String,
    "name": String,
    "device_id": String
});
// je crée un model et j'attache le schema ci dessus
var Particle = mongoose.model('Particle', particleSchema);

module.exports = Particle;
