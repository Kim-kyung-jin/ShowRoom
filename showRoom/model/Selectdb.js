const mongoose=require('mongoose');
const Schema=mongoose.Schema;
mongoose.Promise=global.Promise;

var SelectedBoardSchema = mongoose.Schema({
	selectboardUserId: String,
	selectboardLeftPhoto: String, 
	selectboardRightPhoto: String, 
	selectboardContent: String, 
	selectboardDatetime: String, 
	selectboardLeftLike: [Number],
	selectboardRightLike: [Number],
	selectboardSelectUsers: [String],
	selectboardExit: { type: Boolean, 'default': true },
	selectboardDelete:String
	//selectboardDelete:{type:Date,  /* 시간표시*/expires:60,'default':undefined}
});

var SelectBoard = mongoose.model('selectBoards', SelectedBoardSchema);

module.exports = SelectBoard;



