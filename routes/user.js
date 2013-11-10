var User = require('../model/user').User;
var PlantedMine = require('../model/planted_mine.js').PlantedMine;
var SpentMine = require("../model/spent_mine.js").SpentMine;
var geoHelpers = require("../lib/geo_helpers");



exports.fetch = function(req, res){
    if(!req.params.id){

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
            console.log( pm);
            plantedMines.push(pm.forPublic());
        }

        return sendSuccess(res, {user:user, plantedMines:plantedMines});

    });
};

exports.test = function(req, res){
    User.findOne({uuid:'asdfjkl;'}, function(err, user){
        var geoPoint = geoHelpers.latlongToGeoPoint(40.711093, -73.948975);
        query = {bomber:user, loc:geoPoint};
        console.log(query);
        PlantedMine.create(query, function(err, PM){
            console.log(err);
            res.json(PM);
        });
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
