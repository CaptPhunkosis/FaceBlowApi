var mongoose = require('mongoose');
var User = require('./user');
var createUpdateInfo = require('./plugins/create_update_info');

var PlantedMineSchema = new mongoose.Schema({
    loc:{type:{'type':String, 'coordinates': {}}},
    bomber: {type: mongoose.Schema.Types.ObjectId, ref: "User"}

});
PlantedMineSchema.index({loc: '2dsphere'});
PlantedMineSchema.path('loc.type').required(true);
PlantedMineSchema.plugin(createUpdateInfo);


var PlantedMine = mongoose.model('PlantedMine', PlantedMineSchema);
module.exports = {PlantedMine: PlantedMine}
