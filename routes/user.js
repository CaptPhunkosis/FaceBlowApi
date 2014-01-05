var User = require('../model/user').User;
var PlantedMine = require('../model/planted_mine.js').PlantedMine;
var SpentMine = require("../model/spent_mine.js").SpentMine;
var geoHelpers = require("../lib/geo_helpers");
var config = require('../config');



exports.fetch = function(req, res){
    if(!req.params.id){
        sendFailure(res, 500, 'Missing required param');
    }

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



exports.plantMine = function(req, res){
    var uuid = req.params.id;
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


exports.tripMine = function(req, res) {
    var mineID = req.query.mineID;
    var uuid = req.params.id;

    User.findOne({uuid:uuid}, function(err, user){
        if(err){
            return sendFailedToTripMine(res);
        }

        PlantedMine.findOne(mineID, function(err, plantedMine){
            if(err){
                return sendFailedToTripMine(res);
            }

            SpentMine.createFromPlanted(user, plantedMine, function(err, spentMine){
                if(err){
                    return sendFailedToTripMine(res);
                }

                plantedMine.remove(function(err, delPlantedMine){
                    if(err){
                        return sendFailedToTripMine(res);
                    }
                    return sendSuccess(res, spentMine.forPublic());
                });
            });
        });
    });
}


exports.test = function(req, res){
    PlantedMine.findOne(function(err, mine){
        SpentMine.createFromPlanted(mine.bomber, mine, function(err, spentmine){
            if(err) return sendFailure(res, err)
            return sendSuccess(res, spentmine.forPublic());
        });
    });
};



function sendFailedToTripMine(res){
    sendFailure(res, 500, "Failed To Trip Mine");
}

function sendFailedToPlantMine(res){
    sendFailure(res, 500, "Failed To Plant Mine");
}

function sendSuccess(res, data){
    var result = {error: null, data: data}
    res.json(result);
}

function sendFailure(res, code, error){
    var result = {error:error, code:code};
    res.json(code, result);
}

