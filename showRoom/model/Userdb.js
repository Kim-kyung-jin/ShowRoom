const mongoose=require('mongoose');
const Schema=mongoose.Schema;
mongoose.Promise=global.Promise;

var UserSchema=mongoose.Schema({
	userId:String,
	userPwd:String,
	userPhoto:String,
	userName:String,
	userAge:Number,
	userCodyMybag:[String],
	userClothMybag:[Number],
	userTommoroowCody:String,
	userFavoriteCodyCheck : [String],
	userFavorite:[{
		favoriteCategoryCode:String,
		favoriteScore:Number
	}],
	userPushOnOff:Boolean,
	userPushMessage:[{
		pushInfo:Number,
		pushMessage:String,
		pushMigrate:String,
		pushConfirm:Boolean
	}],
	userCodyTag:[{
		tagName:String,
		tagScore:Number
	}],
	userPushA:String,
	userPushI:String,
	userDatetime:String,
	userLocal:String,
	userLoginType:String
});

var User=mongoose.model('User',UserSchema);

module.exports=User;