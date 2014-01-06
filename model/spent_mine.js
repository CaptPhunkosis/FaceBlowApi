var mongoose = require('mongoose');
var User = require('./user');
var createUpdateInfo = require('./plugins/create_update_info');
var geoHelpers = require("../lib/geo_helpers");



/*
 *  Schema Definition
 */
var SpentMineSchema = new mongoose.Schema({
    loc:{'type':{type:String}, coordinates: []},
    bomber: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
    bombed: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
    explodedAt: {type: Date, default: Date.now},
    bombedAcknowledged: {type: Boolean, default: false}
});
SpentMineSchema.index({loc: '2dsphere'});
SpentMineSchema.path('loc.type').required(true);
SpentMineSchema.plugin(createUpdateInfo);


/*
 * Static Methods
 */
SpentMineSchema.statics.createFromPlanted = function(bombedUser, plantedMine, callback) {
    //Apparently you can't just pass 'loc' property from plantedmines to spentmines
    var geoPoint = geoHelpers.latlongToGeoPoint(plantedMine.loc.coordinates[1], plantedMine.loc.coordinates[0]);
    query = {loc:geoPoint, bomber:plantedMine.bomber, bombed:bombedUser};
    this.create(query, function(err, spentMine){
        //You can only use populate on "query" methods. Doesn't work with create.
        SpentMine.findOne(spentMine).populate('bomber').populate('bombed').exec(callback);
    });
}




/*
 * Model Methods
 */
SpentMineSchema.methods.forPublic = function(){
    var result = {
        id: this._id,
        long: this.loc.coordinates[0],
        lat: this.loc.coordinates[1],
        createdOn: this.createdOn,
        bomber: this.bomber.uuid,
        bombed: this.bombed.uuid,
        explodedAt: this.explodedAt
    };
    return result;
}


/*
 * Define the model
 */
var SpentMine = mongoose.model("SpentMine", SpentMineSchema);
module.exports = {SpentMine: SpentMine}


