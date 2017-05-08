const mongoose=require("mongoose");
const Schema=mongoose.Schema;
mongoose.Promise=global.Promise;

var BoardSchema = mongoose.Schema({
	boardUserId: String,
	boardUserName: String, 
	boardPhoto: String, 
	boardContent: String, 
	boardDatetime: String, 
	boardLikeUsers: [String], 
	boardTodayCount: Number,
	boardBestDate: String,
	boardComments: [{
		boardCommentsUserId : String,
		boardCommentsName : String,
		boardCommentsContent : String,
		boardCommentsDatetime : String
	}],
	boardOnOff:Boolean,
	boardAge:[Number]
});

var Board = mongoose.model('boards', BoardSchema);

module.exports=Board;