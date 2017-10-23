var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var Particle = require('particle-api-js');

var User = require('./models/user.js');

var app = express();

var Devices = require('./models/devices.js');
var EventObj = require('./models/eventsObj.js');

var resistorRead = require('./models/resistorRead.js');

var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

var particle = new Particle();

var token;
var myDevice = '3f0032001147353138383138';




// Mongo Connexion (User)
var promise = mongoose.connect('mongodb://thm-meder:pass1111@ds127375.mlab.com:27375/users', {
    useMongoClient: true,
});

// Mongo Connexion (Photon)
var promise2 = mongoose.connect('mongodb://thm-meder:pass1111@ds227045.mlab.com:27045/photon', {
    useMongoClient: true
});

promise.then(
    () => {

            console.log('db.connected');
            app.listen(3000, function() {
                console.log('listening on 3000 and database is connected');
                io.sockets.on('connection', function (socket) {
                	    	console.log("Someone is connected");
                	    	socket.emit('monsocket2', { hello: "world" });
                });
            });

    },
    err => {
        console.log('MONGO ERROR');
        console.log(err);
    }

);


// Configs
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.set('views', './views');
app.set('view engine', 'jade');

app.use('/js', express.static('./client/js'));
app.use('/css', express.static('./client/css'));


app.get('/', function(req, res) {
    res.sendFile(__dirname + '/client/index.html')
});

app.get('/photon', function(req, res) {
    res.sendFile(__dirname + '/client/index_photon.html');
});


app.get('/display/device/:id', function(req, res) {
    Devices.findOne({'id':req.params.id},function(err,objet){
        if(err){
            console.log('Find Error' + err);
        }
        else {
            res.cookie('data', JSON.stringify(req.params.id));
            res.sendFile(__dirname + '/client/photon.html', { id: req.params.id });
        }
    });
});

app.get('/api/liste', function(req, res) {
    user.find({}, function(err, collection) {
        if (err) {
            console.log(err);
            return res.send(500);
        } else {
            return res.send(collection);
        }
    });

});

app.get('/api/liste/:id', function(req, res) {
    console.log(req.params);
    console.log(req.params.id);
    User.findOne({
        "_id": req.params.id
    }, function(err, monobject) {
        if (err) {
            console.log(err);
            return res.send(err);
        } else {

            res.send(monobject);
        }
    });


});

app.post('/new', function(req, res) {
    console.log(req.body);
    console.log("my name is " + req.body.nom);
    var userToSave = new User(req.body);

    userToSave.save(function(err, success){
            if(err){
                return console.log(err);
            }
            else{
                console.log(success);
                res.send(success);

            }
        });

});

app.delete('/api/liste/:id', function(req, res) {
    console.log(req.body);
    User.findByIdAndRemove(req.params.id,function(err, response){
        if(err){
            console.log(err);
        }
        else{
            console.log(response);
            console.log("deleted");
            res.send(200);

        }
    });


});

app.put('/api/liste/:id', function(req, res) {
    console.log(req.params);
    console.log(req.body);
    console.log(req.params.id);

    User.findByIdAndUpdate(req.params.id,req.body, { new: true }, function (err, updatedUser) {
      if (err) return handleError(err);
      console.log(updatedUser);
      res.status(200).send(updatedUser);
    });

});


// return Device parameters by id

app.get('/devices/unique/:id', function(req,res){
    Devices.findOne({'id':req.params.id},function(err,objet){
        if(err){
            console.log('Find Error' + err);
        }
        else {
            console.log('Objet : ' + objet);
            return res.send(objet);
        }
    });
});

// return all devices

app.get('/devices/list', function(req,res){

    Devices.find(function(err, collection) {
        if (err) {
            console.log(err);
            return res.send(500);
        } else {
            return res.send(collection);
        }
    });
});

/*

    Particle

*/

particle.login({username:'thm.meder@gmail.com',password:'shyriku1105'}).then(
    function(data){
        token = data.body.access_token;
        console.log(token);
        var devicesPr = particle.listDevices({ auth: token });
        devicesPr.then(
            function(devices){
              devices.body.forEach(function(device){
                Devices.findOne({"id":device.id}, function(err,objet){
                    if(objet) {
                        console.log('device Update in progress');
                        var dateActu = new Date();
                        var toUpdate = new Devices(objet);
                        toUpdate.last_heard = dateActu.toISOString();
                        Devices.findByIdAndUpdate(objet._id,toUpdate,{new:true}, function(err,objet){
                            if(err){
                                console.log('Update Error ' + err);
                            }else{
                                console.log('Device updated ');
                            }
                        });

                    }
                    else if(err) {
                        console.log('Error '+ err);
                    }
                    else {
                        console.log('device Add in progress');
                        var toSave = new Devices(device);
                        toSave.save(function(err,success){
                            if(err){
                                console.log('Add Error '+ err);
                            }else{
                                console.log('Device added');
                            }
                        });
                    }
                })

              });
            },
            function(err) {
              console.log('List devices call failed: ', err);
            }
        );
        particle.getEventStream({
            deviceId: myDevice,
            auth: token
        }).then(function(stream) {
            stream.on('event', function(data) {
                console.log("Event: " + JSON.stringify(data));
                io.sockets.emit('monsocket', JSON.stringify(data));
            });
      });

    },
    function(err){
        console.log('Could not login '+ err);
    }
);
