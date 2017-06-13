const SelectBoardController=require('../utils/selectController.js')
	  ,UserController=require('../utils/userController.js')
	  ,Select=require('../model/Selectdb');
const moment=require('moment');
const async=require('async');
const config=require('config');
const fs=require('fs');
const jsonWebToken=require('../utils/jsonWebToken');
const ObjectId = require('mongodb').ObjectID;	
const multer = require('../utils/multers3.js');
moment.locale("ko");
var current_time=new moment().format("YYYY-MM-DD HH:mm:ss");
var output=new Object();



//랜덤리스트주기
async function randomListView(list) {
	return new Promise(function(resolve,reject) {
		if(list == 0) 
			resolve(0);
		else {
			let max = list.length;
			let randomnum = Math.floor(Math.random() * (max));
			let dataresult = {
				_id: list[randomnum]._id,
				selectboardRightPhoto: list[randomnum].selectboardRightPhoto,
				selectboardLeftPhoto: list[randomnum].selectboardLeftPhoto,
				selectboardContent: list[randomnum].selectboardContent,
				selectboardName: list[randomnum].selectboardName,
				selectboardUserName: '',
				selectboardUserPhoto: '',
			}
			let array = [];
			array.push(dataresult);
			array.push(list[randomnum].selectboardUserId);
			resolve(array);
		}
	});
}

//선택게시판 등록
exports.addSelectBoard = async function(req,res,next) {
	let userTokenCheck = req.headers.usertoken;
	if(userTokenCheck == 'guest'){
		output.msg = "fail";
		res.setHeader('userToken', 'guest');
	}
	else if(userTokenCheck == undefined) {
		output.msg="success";
		res.setHeader('userToken','guest');
	}
	else if(userTokenCheck == null) {
		output.msg="success";
		res.setHeader('userToken','guest');
	}
	else {
		let userToken = await jsonWebToken.TokenCheck(req.headers.usertoken);
		let userIdCheckdata = { _id: userToken.ObjectId };
		let userInfo = await UserController.getUserFindObjectId(userIdCheckdata);
		let select = new Select();
		
		let leftPhotoFile = req.files.leftPhoto[0].transforms[0].location;
		let rightPhotoFile = req.files.rightPhoto[0].transforms[0].location;

		select.selectboardUserName = userInfo.userName;
		select.selectboardName = req.body.selectboardName;
		select.selectboardContent = req.body.selectboardContent;
		select.selectboardDatetime = new moment().format("YYYY-MM-DD");
		select.selectboardLeftPhoto = leftPhotoFile;
		select.selectboardRightPhoto = rightPhotoFile;
		select.selectboardUserId = select.selectboardSelectUsers = userInfo.userId;
		select.selectboardLeftPhotoKey = req.files.leftPhoto[0].transforms[0].key;
		select.selectboardRightPhotoKey = req.files.rightPhoto[0].transforms[0].key;
		let listSelectBoarddata = {"selectboardSelectUsers": {"$ne": userInfo.userId}, "selectboardExit":true, "selectboardDelete": true};
		let [listSelectBoard, saveSelectBoard] = await Promise.all([
			SelectBoardController.listSelectFind(listSelectBoarddata),SelectBoardController.saveSelectBoard(select)
		]);
		let saveCheckData = {"selectboardUserId":userInfo.userId, "selectboardExit": true};
		let saveChecksort = {"selectboardDatetime": 1};
		let saveCheck = await SelectBoardController.saveCheckSelectBoard(saveCheckData, saveChecksort);
		let listView = await randomListView(listSelectBoard);
		if(listView == 0) {
			output.msg = "success";
			output.data = {
				result: "Is not Data"
			}
		}
		else {
			output.msg = "success";
			output.data = {
				result: listView
			}
		}
		res.setHeader('userToken',userToken.userToken);
	}
	res.json(output);
}
//게스트 리스트 줘야댐
//리스트뿌리기
exports.listSelectBoard = async function(req,res,next) {
	let userTokenCheck = req.headers.usertoken;
	if(userTokenCheck == 'guest'){
		output.msg = "fail";
		let listSelectBoarddata = {"selectboardExit":true, "selectboardDelete": true};
		let listSelectBoard = await SelectBoardController.listSelectFind(listSelectBoarddata);
		let listView = await randomListView(listSelectBoard);
		let selectboardNamequery = { userId: listView[1] }
		let selectboarduserInfo = await  UserController.getUserFindObjectId(selectboardNamequery);
		listView[0].selectboardUserName = selectboarduserInfo.userName;
		listView[0].selectboardUserPhoto = '나중에 넣을께';
		output.msg = "success";
		output.data = listView[0];
		res.setHeader('userToken', 'guest');
	}
	else if(userTokenCheck == undefined) {
		output.msg="success";
		res.setHeader('userToken','guest');
	}
	else if(userTokenCheck == null) {
		output.msg="success";
		res.setHeader('userToken','guest');
	}
	else {
		let userToken = await jsonWebToken.TokenCheck(req.headers.usertoken);
		let userIdCheckdata = { _id: userToken.ObjectId };
		let userInfo = await UserController.getUserFindObjectId(userIdCheckdata);
		let listSelectBoarddata = {"selectboardSelectUsers": {"$ne": userInfo.userId}, "selectboardExit":true, "selectboardDelete": true};
		let listSelectBoard = await SelectBoardController.listSelectFind(listSelectBoarddata);
		let listView = await randomListView(listSelectBoard);
		let selectboardNamequery = { userId: listView[1] }
		let selectboarduserInfo = await  UserController.getUserFindObjectId(selectboardNamequery);
		listView[0].selectboardUserName = selectboarduserInfo.userName;
		listView[0].selectboardUserPhoto = '나중에 넣을께';
		if(listView == 0) {
			output.msg = "success";
			output.data = "Is not Data";
		}
		else {
			output.msg = "success";
			output.data = listView[0];
		}
		res.setHeader('userToken',userToken.userToken);
	}
	res.json(output);
}
//투표중지
exports.stopSelectBoard = async function(req,res,next) {
	let userTokenCheck = req.headers.usertoken;
	if(userTokenCheck == 'guest'){
		output.msg = "fail";
		res.setHeader('userToken', 'guest');
	}
	else if(userTokenCheck == undefined) {
		output.msg="success";
		res.setHeader('userToken','guest');
	}
	else if(userTokenCheck == null) {
		output.msg="success";
		res.setHeader('userToken','guest');
	}
	else {
		let userToken = await jsonWebToken.TokenCheck(req.headers.usertoken);
		let userIdCheckdata = { _id: userToken.ObjectId };
		let userInfo = await UserController.getUserFindObjectId(userIdCheckdata);
		let detailSelectBoardquery = {_id: ObjectId(req.params.selectBoardId)};
		let detailSelectBoard = await SelectBoardController.findSelectBoard(detailSelectBoardquery, userInfo.userId);
		let stopSelectBoardset = {"$set": {"selectboardExit": false}};
		let stopSelectBoard = await SelectBoardController.updateSelectBoard(detailSelectBoardquery, stopSelectBoardset);
		output.msg = "success";
		output.data = {
			result: "stop success"
		}
		res.setHeader('userToken',userToken.userToken);
	}
	res.json(output);
}
//게스트 보스트
//투표하기
exports.boteSelectBoard = async function(req,res,next) {
	let userToken = await jsonWebToken.TokenCheck(req.body.userToken);
	let userIdCheckdata = { _id: userToken.ObjectId };
	let userInfo = await UserController.getUserFindObjectId(userIdCheckdata);
	let detailSelectBoardquery = {_id: ObjectId(req.params.selectBoardId)};
	let boteset = '';
	if(req.params.bote == 0)
		boteset = {"$push": {"selectboardSelectUsers": userInfo.userId, "selectboardLeftLike": userInfo.userAge}};
	else 
		boteset = {"$push": {"selectboardSelectUsers": userInfo.userId, "selectboardRightLike": userInfo.userAge}};
	let boteSelectBoard = await SelectBoardController.updateSelectBoard(detailSelectBoardquery, boteset);
	let listSelectBoarddata = {"selectboardSelectUsers": {"$ne": userInfo.userId}, "selectboardExit":true, "selectboardDelete": true};
	let listSelectBoard = await SelectBoardController.listSelectFind(listSelectBoarddata);
	let listView = await randomListView(listSelectBoard);
	if(listView == 0) {
		output.msg = "success";
		output.data = {
			userToken: userToken.userToken,
			result: "Is not Data"
		}
	}
	else {
		output.msg = "success";
		output.data = {
			userToken: userToken.userToken,
			result: listView
		}
	}
	res.json(output);
}
//삭제하기
exports.deleteSelectBoard = async function(req,res,next) {
	let userTokenCheck = req.headers.usertoken;
	if(userTokenCheck == 'guest'){
		output.msg = "fail";
		res.setHeader('userToken', 'guest');
	}
	else if(userTokenCheck == undefined) {
		output.msg="success";
		res.setHeader('userToken','guest');
	}
	else if(userTokenCheck == null) {
		output.msg="success";
		res.setHeader('userToken','guest');
	}
	else {
		let userToken = await jsonWebToken.TokenCheck(req.headers.usertoken);
		let userIdCheckdata = { _id: ObjectId(userToken.ObjectId) };
		let userInfo = await UserController.getUserFindObjectId(userIdCheckdata);
		let detailSelectBoardquery = {_id: ObjectId(req.params.selectBoardId)};
		let detailSelectBoard = await SelectBoardController.findSelectBoard(detailSelectBoardquery, userInfo.userId);
		let after_time = moment().add(30, 'days');
		let times = after_time.format("YYYY-MM-DD");
		let deleteSelectBoardset = {"$set": {"selectboardExit": false , "selectboardDelete": false, "selectboardDeleteTime": times}};
		let deleteSelectBoard = await SelectBoardController.updateSelectBoard(detailSelectBoardquery, deleteSelectBoardset);
		output.msg = "success";
		output.data = {
			result: "delete sucess"
		}
		res.setHeader('userToken',userToken.userToken);
	}
	res.json(output);
}
//게시물 진짜 삭제
exports.deleteSelectBoardSche = async function() {
	let deletePhoto = [];
	let after_time = moment().add(30, 'days');
	//let dbdeletetime=new moment().format("YYYY-MM-DD");
	let dbdeletetime = after_time.format("YYYY-MM-DD");
	let deleteSelectBoardFind = {"selectboardDeleteTime": dbdeletetime};
	let deleteBoard = await SelectBoardController.removeSelectBoard(deleteSelectBoardFind);
	for(let i=0; i<deleteBoard.length; i++)
		deletePhoto.push({Key: deleteBoard[i]});
	await multer.deleteFile(deletePhoto);
	console.log("삭제갯수 :" + (deleteBoard.length/2));
	return;
}


