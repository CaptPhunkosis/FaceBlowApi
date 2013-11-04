var mongoose = require('mongoose');
var User = require('./user');
var createUpdateInfo = require('./plugins/create_update_info');

var SpentMineSchema = new mongoose.Schema({
    loc:{type:{'type':String, 'coordinates':[]}},
    bomber: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
    bombed: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
    explodedAt: Date,
});
SpentMineSchema.index({loc: '2dsphere'});
SpentMineSchema.path('loc.type').required(true);
SpentMineSchema.plugin(createUpdateInfo);

var SpentMine = mongoose.model("SpentMine", SpentMineSchema);
module.exports = {SpentMine: SpentMine}
