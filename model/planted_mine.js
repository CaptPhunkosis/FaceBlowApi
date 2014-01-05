var mongoose = require('mongoose');
var User = require('./user');
var createUpdateInfo = require('./plugins/create_update_info');
var geoHelpers = require("../lib/geo_helpers");


/*
 *  Schema Definition
 */
var PlantedMineSchema = new mongoose.Schema({
    loc:{'type':{type:String}, coordinates: []},
    bomber: {type: mongoose.Schema.Types.ObjectId, ref: "User"}

});
PlantedMineSchema.index({loc: '2dsphere'});
PlantedMineSchema.path('loc.type').required(true);
PlantedMineSchema.plugin(createUpdateInfo);



/*
 * Static Methods
 */
PlantedMineSchema.statics.findUserMines = function(user, callback) {
    this.find({bomber: user._id}, function(err, mines){
        if(err){
            return callback(err, null);
        }

        return callback(null, mines);
    });
};


PlantedMineSchema.statics.findNearest = function(latitude, longitude, maxDistance, callback) {

    var geoPoint = geoHelpers.latlongToGeoPoint(latitude, longitude);
    var query = {'loc': {'$near': {'$geometry': geoPoint, '$maxDistance':maxDistance}}};
    this.find(query).populate('bomber').exec(function(err, mines){
        if(err){
            return callback(err, null)
        }
        return callback(err, mines);
    });
};




/*
 * Model Methods
 */

PlantedMineSchema.methods.forPublic = function(){
    var result = {
        id: this._id,
        long: this.loc.coordinates[0],
        lat: this.loc.coordinates[1],
        createdOn: this.createdOn,
        bomber: this.bomber.uuid
    };
    return result;
}


/*
 * Define the model
 */
var PlantedMine = mongoose.model('PlantedMine', PlantedMineSchema);
module.exports.PlantedMine = PlantedMine;
