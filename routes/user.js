var User = require('../model/user').User;
var PlantedMine = require('../model/planted_mine.js').PlantedMine;
var SpentMine = require("../model/spent_mine.js").SpentMine;
var geoHelpers = require("../lib/geo_helpers");
var config = require('../config');



exports.fetch = function(req, res){
    if(!req.params.id){
        sendFailure(res, 500, 'Missing required param');
    }

    query = {uuid: req.params.id};
    options = {upsert: true};
    User.findUserAndMines(req.params.id, function(err, results){
        if(err){
            console.log(err);
            return sendFailure(res, 500, "Failed To Retrieve User");
        }

        var user = results.user.forPublic();
        var plantedMines = new Array();

        for(var i=0; i < results.plantedMines.length; i++){
            var pm = results.plantedMines[i];
            plantedMines.push(pm.forPublic());
        }

        return sendSuccess(res, {user:user, plantedMines:plantedMines});

    });
};



//curl -d "id=asdfjkl;&latitude=40.679514&longitude=-73.992561" http://localhost:3000/user/plantmine
//curl -d "id=asdfjkl;&latitude=40.678126&longitude=-73.990753" http://localhost:3000/user/plantmine
//curl -d "id=asdfjkl;&latitude=40.680047&longitude=-73.990066" http://localhost:3000/user/plantmine
//curl -d "id=asdfjkl;&latitude=40.679526&longitude=-73.991997" http://localhost:3000/user/plantmine
exports.plantMine = function(req, res){
    var uuid = req.body.id;
    var longitude = Number(req.body.longitude);
    var latitude = Number(req.body.latitude);

    if(!uuid || !longitude || !latitude){
        sendFailure(res, 500, 'Missing required param');
    }

    PlantedMine.findNearest(latitude, longitude, config.mines.maxDistance, function(err, mines){
        if(err || mines.length > 0) {
            return sendFailedToPlantMine(res);
        }

        User.findOne({uuid:uuid}, function(err, user){
            if(err || !user){
                console.log(err);
                return sendFailedToPlantMine(res);
            }

            var geoPoint = geoHelpers.latlongToGeoPoint(latitude, longitude);
            var query = {bomber:user, loc:geoPoint};
            PlantedMine.create(query, function(err, plantedMine) {
                if(err){
                    console.log(err);
                    return sendFailedToPlantMine(res);
                }

                return sendSuccess(res, plantedMine.forPublic());
            });
        });
    });
}

function sendFailedToPlantMine(res){
    sendFailure(res, 500, "Failed To Plant Mine");
}


exports.checkForMines = function(req, res){
    var latitude = req.query.latitude;
    var longitude = req.query.longitude;
    var uuid = req.params.id;

    if(!latitude || !longitude || !uuid){
        return sendFailure(res, 500, "Invalid Params");
    }

    PlantedMine.findNearest(latitude, longitude, config.mines.maxDistance, function(err, mines){
        if(err){
            console.log(err);
            return sendFailure(res, 500, "Failed To Retrieve Data");
        }

        var userMines = Array();
        var otherMines = Array();
        for(i in mines){
            if(uuid == mines[i].bomber.uuid){
                userMines.push(mines[i].forPublic());
            }else{
                otherMines.push(mines[i].forPublic());
            }
        }
        result = {users:userMines, others:otherMines}
        return sendSuccess(res, result);
    });
}


exports.test = function(req, res){
    PlantedMine.findNearest(40.679416, -73.992614, config.mines.maxDistance, function(err, mines){
        return sendSuccess(res, mines);
    });
};


function sendSuccess(res, data){
    var result = {error: null, data: data}
    res.json(result);
}

function sendFailure(res, code, error){
    var result = {error:error, code:code};
    res.json(code, result);
}

