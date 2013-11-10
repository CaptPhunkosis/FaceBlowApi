var mongoose = require('mongoose');
var User = require('./user');
var createUpdateInfo = require('./plugins/create_update_info');

var PlantedMineSchema = new mongoose.Schema({
    loc:{'type':{type:String}, coordinates: []},
    bomber: {type: mongoose.Schema.Types.ObjectId, ref: "User"}

});
PlantedMineSchema.index({loc: '2dsphere'});
PlantedMineSchema.path('loc.type').required(true);
PlantedMineSchema.plugin(createUpdateInfo);

PlantedMineSchema.statics.findUserMines = function(user, callback) {
    this.find({bomber: user._id}, function(err, mines){
        if(err){
            return callback(err, null);
        }

        return callback(null, mines);
    });
};

PlantedMineSchema.methods.forPublic = function(){
    var result = {
        lat: this.loc.coordinates[0],
        long: this.loc.coordinates[1],
        bomber: this.bomber.uuid,
        updatedOn: this.updatedOn,
        createdOn: this.createdOn
    };
    return result;
}


var PlantedMine = mongoose.model('PlantedMine', PlantedMineSchema);
module.exports.PlantedMine = PlantedMine;
