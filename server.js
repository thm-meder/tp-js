var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var Particle = require('particle-api-js');

var User = require('./models/user.js');

var app = express();

var Particles = require('./models/particle.js');
var EventObj = require('./models/eventsObj.js');

var resistorRead = require('./models/resistorRead.js');

var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

var particle = new Particle();

// Device Photon
var token;
var myDevice = '3f0032001147353138383138';

// Instance connexion Mongo (users)
var promise = mongoose.connect('mongodb://localhost:27017/ifa', {
    useMongoClient: true,
});

// Instance connexion Mongo (particle Photon)
var promise2 = mongoose.connect('mongodb://localhost:27017/ifaParticle', {
    useMongoClient: true
});

// Quand connexion réussie
promise.then(
    () => {
                console.log('db.connected');
                app.listen(3000, function() {
                    console.log('listening on 3000 and database is connected');
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


//Actions
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/client/index.html')
});
app.get('/profil', function(req, res) {
    res.sendFile(__dirname + '/client/profil.html')
});

app.get('/photon', function(req, res) {
    res.sendFile(__dirname + '/client/index_photon.html');
});

//Display device by Id
app.get('/display/photon/:id', function(req, res) {
    Photons.findOne({'id':req.params.id},function(err,objet){
        if(err){
            //res.send('Find Error' + err);
            console.log('Find Error' + err);
        }
        else {
            res.cookie('data', JSON.stringify(req.params.id));
            res.sendFile(__dirname + '/client/photon.html', { id: req.params.id });
        }
    });
});

app.get('/viewPhotonGraph/photon/:id', function(req, res) {
    Photons.findOne({'id':req.params.id},function(err,objet){
        if(err){
            console.log('Find Error' + err);
        }
        else {
            res.cookie('data', JSON.stringify(req.params.id));
            res.sendFile(__dirname + '/client/ledIntensity.html', { id: req.params.id });
        }
    });
});

// API :
// send user list
app.get('/api/liste', function(req, res) {
    User.find({}, function(err, collection) {
        if (err) {
            console.log(err);
            return res.send(500);
        } else {
            return res.send(collection);
        }
    });

});

// get user by id
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

// Post requests
app.post('/new', function(req, res) {
    console.log(req.body);
    console.log("my name is " + req.body.nom);
    var userToSave = new user(req.body);

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
// gère la suppression
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

// exemple de rendu html / jade
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


// gère les requetes post
app.post('/quotes', function(req, res) {
    console.log(req.body);
    console.log("my name is " + req.body.nom);
    var newUser = {
        nom: req.body.nom,
        prenom: req.body.prenom
    };
    res.send(200);

});


// get device parameter/id

app.get('/photons/unique/:id', function(req,res){
    //res.send(req.params.id);
    Photons.findOne({'id':req.params.id},function(err,objet){
        if(err){
            //res.send('Find Error' + err);
            console.log('Find Error' + err);
        }
        else {
            console.log('Objet : ' + objet);
            //res.send(objet);
            return res.send(objet);
        }
    });
});

// return all devices

app.get('/photon/list', function(req,res){

    Photons.find(function(err, collection) {
        if (err) {
            console.log(err);
            return res.send(500);
        } else {
            return res.send(collection);
        }
    });
});

/*

    Photon Particle

*/

particle.login({username:'thm.meder@gmail.com',password:'shyriku1105'}).then(
    function(data){
        token = data.body.access_token;
        console.log(token);
        var photonsPr = particle.listPhotons({ auth: token });
        photonsPr.then(
            function(photons){
              photons.body.forEach(function(photon){
                Photons.findOne({"id":photon.id}, function(err,objet){
                    if(objet) {
                        console.log('Photon update in progress');
                        var dateActu = new Date();
                        var toUpdate = new Photons(objet);
                        toUpdate.last_heard = dateActu.toISOString();
                        Photons.findByIdAndUpdate(objet._id,toUpdate,{new:true}, function(err,objet){
                            if(err){
                                console.log('Update Error ' + err);
                            }else{
                                console.log('Photon updated ');
                            }
                        });

                    }
                    else if(err) {
                        console.log('Error '+ err);
                    }
                    else {
                        console.log('Photon addition in progress');
                        var toSave = new Photons(photon);
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
              console.log('Fail - Call list device : ', err);
            }
        );
        particle.getEventStream({ deviceId: myDevice,name: 'beamStatus', auth: token }).then(function(stream) {
            stream.on('event', function(data) {

                io.emit('newEvent',data);

            });
        });
        particle.getEventStream({ deviceId: myDevice,name: 'resistorReadValue', auth: token }).then(function(stream) {

            // console.log(stream);

            stream.on('event', function(data) {
                console.log(data)
                if( data.data > 40 ) {
                        io.emit('ledIntensityEmit',data);
                }


            });
        });

    },
    function(err){
        console.log('Could not login '+ err);
    }
);
