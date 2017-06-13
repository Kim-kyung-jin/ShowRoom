const mongoose=require('mongoose');
mongoose.Promise = global.Promise;
const Schema=mongoose.Schema;

const CodyScheme=new Schema({
	codyUserClickAge : {type:[Number], 'default':[]},
	codyTag : [String],
	codyPrice : Number,
	codyShopName : String,
	codyShopPhoto : String,
	codyShopUrl : String,
	codyWeather : {type:[Number], 'default':[]},
	codyDegree : {type:[Number], 'default':[]},
	codyScheduleContent : {type:[Number], 'default':[]},
	codyPhoto : String,
	codyClothNumber : {type:[Number], 'default':[]},
	codyCategoryCode : {type:[String], 'default':[]},
	codyStarUsers : [String],
	codyClothPrice : {type:[Number], 'default':[]},
	codyPhotoKey : String
});

const CodyModel = mongoose.model('Cody', CodyScheme);
module.exports = CodyModel;