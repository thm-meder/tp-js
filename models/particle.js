var mongoose = require('mongoose');

var particleSchema = mongoose.Schema({
    "id": String,
    "name": String,
    "last_app": String,
    "last_ip_address": String,
    "last_heard": Date,
    "product_id": Number,
    "connected": Boolean,
    "platform_id": Number,
    "cellular": Boolean,
    "notes": String,
    "status": String,
    "last_iccid": String,
    "imei": String,
    "current_build_target": String,
    "pinned_build_target": String,
    "default_build_target": String,
});
// je créé un model et j'attache le schema ci-dessus
var Particles = mongoose.model('particles', particleSchema);

module.exports = Particles;
