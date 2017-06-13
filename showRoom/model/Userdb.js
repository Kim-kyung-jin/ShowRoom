const mongoose=require('mongoose');
const Schema=mongoose.Schema;
mongoose.Promise=global.Promise;

var UserSchema=mongoose.Schema({
	userId:String,
	userPwd:String,
	userPhoto:String,
	userPhotoKey:String,
	userName:String,
	userAge:Number,
	userSex:Boolean,
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
	userPushToken: {type: String, 'default':null},
	userDatetime:String,
	userLocal:String,
	userLoginType:String,
	userDelete: {type: Boolean, default:false}
});

var User=mongoose.model('User',UserSchema);

module.exports=User;