var User = require('../model/user').User;
var PlantedMine = require('../model/planted_mine.js').PlantedMine;
var SpentMine = require("../model/spent_mine.js").SpentMine;

exports.list = function(req, res){
    results = new SpentMine();
    res.send(results);
};
