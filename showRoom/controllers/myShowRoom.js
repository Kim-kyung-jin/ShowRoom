const express = require('express');																			
const router = express.Router();				
const config=require('config');//
const mongoose = require('mongoose');																			
const User=require('../model/Userdb.js');
const codyModel = require('../model/CodyModel.js');
const async = require('async');	
const codyControl = require('../utils/codyController');
const myShowRoom = require('../utils/myShowRoomController');
const ObjectId = require('mongodb').ObjectID;	
const dbModel = require('../utils/dbOverlap');  
const category = require('../utils/categoryController');
const shop = require('../utils/shopController');
const UserController=require('../utils/userController');
const jsonWebToken=require('../utils/jsonWebToken');
const Board = require('../model/Boarddb');
const Select =require('../model/Selectdb');
const output=new Object();
const createNamedTuple = require('named-tuple');


//메인화면
exports.main = async function (req, res, next) {
	let token = req.headers;
	let userToken = token.usertoken;
	let page = req.query.page || 1;
	let count=10;
	let pageCount = (page - 1) * count;
	
	if(!userToken){ // 비로그인 시		
		var findData = [
			{"$project":
				{
					_id:1,
					codyPhoto:1,
					codyTag:1,
				}
			},
			{$sample : { size : count}}, //랜덤으로
			{"$skip":pageCount},
			{"$limit":count}
		]
		let codyData = await codyControl.aggregate(codyModel,findData);
		if(codyData == 0){
			output.msg = "data not exist"
			res.json(output);
		}else{
			output.msg = "success"
			output.data = codyData;
			res.json(output);
		}
	}else{//로그인 시
		let userTokenInfo = await jsonWebToken.TokenCheck(userToken);
	    let userIdCheckdata = { _id: userTokenInfo.ObjectId };
    	let userInfo = await UserController.getUserFindObjectId(userIdCheckdata);
		var userTagInfo = userInfo.userCodyTag;
		userTagInfo.sort(function(a, b) { //태그 점수별로 정렬
	    	return parseFloat(b.tagScore) - parseFloat(a.tagScore);
		});

		var tagArray =[];
		for(var key in userTagInfo){
			var tagData= {};
			tagData.tagName = userTagInfo[key].tagName;
			tagData.tagScore = userTagInfo[key].tagScore;
			tagArray.push(tagData);
		}

		var userCodeInfo = userInfo.userFavorite;
		userCodeInfo.sort(function(a, b) {//카테고리코드 점수별로 정렬
		    return parseFloat(b.favoriteScore) - parseFloat(a.favoriteScore);
		});

		var firstNumber;
		var fCodeRankArray = [];
		var sCodeRankArray = [];
		var tCodeRankArray = [];
		//카테고리코드 분류 
		for(var key in userCodeInfo){
			firstNumber = Math.floor(userCodeInfo[key].favoriteCategoryCode/100000000)
			if(firstNumber == 1 ){
				var fCodeRank= {};
				fCodeRank.categoryCode = userCodeInfo[key].favoriteCategoryCode;
				fCodeRank.score = userCodeInfo[key].favoriteScore;
				fCodeRankArray.push(fCodeRank)
			}else if(firstNumber == 2 ){
				var sCodeRank= {};
				sCodeRank.categoryCode = userCodeInfo[key].favoriteCategoryCode;
				sCodeRank.score = userCodeInfo[key].favoriteScore;
				sCodeRankArray.push(sCodeRank)
			}else if(firstNumber == 3 ){
				var tCodeRank= {};
				tCodeRank.categoryCode = userCodeInfo[key].favoriteCategoryCode;
				tCodeRank.score = userCodeInfo[key].favoriteScore;
				tCodeRankArray.push(tCodeRank)
			}
		}

		var tagRank = [];
		var fCodeRank = [];
		var sCodeRank = [];
		var tCodeRank = [];
		
		tagRank = tagRank.concat(tagArray[0],tagArray[1],tagArray[2]);
		fCodeRank = fCodeRank.concat(fCodeRankArray[0],fCodeRankArray[1],fCodeRankArray[2]);
		sCodeRank = sCodeRank.concat(sCodeRankArray[0],sCodeRankArray[1],sCodeRankArray[2]);
		tCodeRank = tCodeRank.concat(tCodeRankArray[0],tCodeRankArray[1],tCodeRankArray[2]);

		var tagSearch = []
		var totalSearch = [] 
		for(var i=0; i<3; i++ ){
			tagSearch = tagSearch.concat(tagRank[i].tagName);
			totalSearch = totalSearch.concat(fCodeRank[i].categoryCode,sCodeRank[i].categoryCode,tCodeRank[i].categoryCode)
		}

	    var testBag = [];
		var testMybag = userInfo.userCodyMybag;
		for(var i=0 ; i<testMybag.length;i++){
			testBag.push(ObjectId(testMybag[i]));
		};

		var findData =		[
			{ "$match": { 
				"$or": [{ codyCategoryCode:{ $in : totalSearch } },{ codyTag :{ $in : tagSearch }
				    }
				  ]
				}
			},
			{ $project : {
				codyPhoto : 1,
			   	codyShopName : 1,
		   		_id : 1,
		   		codyCategoryCode : 1,
		   		userIsStar :  { $in: [ "$_id", { $literal: testBag } ] },
		   		codyTag :  1
		   		}
			},
		   	{ $sort: { _id: -1 }},
			{"$skip":pageCount},
			{"$limit":count}
		];
		let codyData = await codyControl.aggregate(codyModel,findData) //유저선호도 검사가 된 codyId를 제외한 codyId를 랜덤으로 한개를 보여준다.
		totalData = [];
		for(var i = 0; i<codyData.length; i++){ //db뽑은 데이터 
			totalScore = 0;
			var totalCodyData= {};
			totalCodyData.ShopName
			totalCodyData.tagName ;
			totalCodyData.codyPhoto ;
			totalCodyData.userIsStar ;
			totalCodyData._id ;
			const Point = createNamedTuple('Point', 'tag', 'code');
			const p = new Point(codyData[i].codyTag,codyData[i].codyCategoryCode);
				
			for(var tagKey in p.tag){ // tag 수만큼
				for(var key in userTagInfo){ // 유저전체 태그수만큼
					if(userTagInfo[key].tagName == p.tag[tagKey]){
						totalScore = totalScore + userTagInfo[key].tagScore;
					}
				}
			}
				
			for(var codeKey in p.code){ // 코드 수만큼
				for(var key in userCodeInfo){ // 유저전체 코드수만큼
					if(userCodeInfo[key].favoriteCategoryCode == p.code[codeKey]){
						totalScore = totalScore + userCodeInfo[key].favoriteScore;
					}
				}
			}								
			totalCodyData.ShopName = codyData[i].codyShopName;
			totalCodyData._id = codyData[i]._id;
			totalCodyData.codyTag = codyData[i].codyTag;
			totalCodyData.codyPhoto = codyData[i].codyPhoto
			totalCodyData.userIsStar = codyData[i].userIsStar
			totalData.push(totalCodyData);
		}
		totalData.sort(function(a, b) {
		    return parseFloat(b.score) - parseFloat(a.score);
		})
		
		output.msg="success";
		output.data = totalData
		output.userToekn = userTokenInfo.userToken
    	res.json(output);
	}
};



//코디 순위
exports.codyRank = async function (req, res, next){
	var findData =	[
	   { $project : {
		   	codyTag : 1,
		   	codyPhoto1 : 1,
	   		_id : 0,
	       	codyUserClickAge : { $size: "$codyUserClickAge"},
	   		}
	   }
	   ,{ $sort: { codyUserClickAge: -1 }}
	];
	let codyRank = await codyControl.aggregate(codyModel,findData);
	res.json({ msg: 'success',  data: codyRank}); 
};



//쇼핑몰 순위
exports.shopRank = async function (req, res, next) {
	var o = {};
	var key
	o.map = function(){
		key = { 
            shopName : this.codyShopName,
            shopPhoto : this.codyShopPhoto
        }
        //this.codyShopName,
		emit(key,this.codyUserClickAge.length);
	}

	o.reduce = function(key,values){
		return Array.sum(values);
	};
	
	o.out = {
		replace: 'shopRanking'
	};
	
	o.verbose = true;
	let shopRank = await myShowRoom.shopRank(codyModel,o)
		
	output.msg="success";
	output.data = shopRank;
	res.json(output);
};


//10대 코디 순위
exports.cody10Rank = async function (req, res, next) {
	var o = {};
	var key;
	o.map=function(){
		for(index in this.codyUserClickAge){
			if(this.codyUserClickAge[index]>9 && this.codyUserClickAge[index]<20){
				key = { 
	                photo : this.codyPhoto,
	                _id : this._id
	            }
				emit(key,1);
			}
		}
	};
	o.reduce=function(k,vals){
		return Array.sum(vals);
	};
	o.out = {
      replace: 'cody10Ranking'
	};
	o.verbose = true;
	
	let Rank10 = await myShowRoom.ageRank(codyModel,o)
	res.json({ data: Rank10 });
};



//20대 코디 순위
exports.cody20Rank = async function (req, res, next) {
	var o = {};
	var key;
	o.map = function(){
		for(index in this.codyUserClickAge){
			if(this.codyUserClickAge[index]>19 && this.codyUserClickAge[index]<30){
				key = { 
		                photo : this.codyPhoto,
		                _id : this._id
		            }
					emit(key,1);
			}
		}
	}
	o.reduce = function(key,values){
		return Array.sum(values);
	};
	o.out = {
      replace: 'cody20Ranking'
  };
	o.verbose = true;
	let Rank20 = await myShowRoom.ageRank(codyModel,o)
	res.json({ data: Rank20 });
};



//30대 코디 순위
exports.cody30Rank = async function (req, res, next) {
	var o = {};
	var key;
	o.map = function(){
		for(index in this.codyUserClickAge){
			if(this.codyUserClickAge[index]>29 && this.codyUserClickAge[index]<40){
				key = { 
		                photo : this.codyPhoto,
		                _id : this._id
		            }
					emit(key,1);
			}
		}
	}
	o.reduce = function(key,values){
		return Array.sum(values);
	};
	o.out = {
      replace: 'cody30Ranking'
  };
	o.verbose = true;
	let Rank30 = await myShowRoom.ageRank(codyModel,o)
	res.json({ data: Rank30 });
};



//40대 코디 순위
exports.cody40Rank = async function (req, res, next) {
	var o = {};
	var key;
	o.map = function(){
		for(index in this.codyUserClickAge){
			if(this.codyUserClickAge[index]>39 && this.codyUserClickAge[index]<10){
				key = { 
		                photo : this.codyPhoto,
		                _id : this._id
		            }
					emit(key,1);
			}
		}
	}
	o.reduce = function(key,values){
		return Array.sum(values);
	};
	o.out = {
      replace: 'cody40Ranking'
  };
	o.verbose = true;
	
	let Rank40 = await myShowRoom.ageRank(codyModel,o)
	res.json({ data: Rank40 });
};


//유저 태그 1~10 순위 
exports.userFavoriteTag = async function (req, res, next){
  	let userTokenInfo = await jsonWebToken.TokenCheck(req.body.userToken);
    let userIdCheckdata = { _id: userTokenInfo.ObjectId };
    let userInfo = await UserController.getUserFindObjectId(userIdCheckdata);
	let userTagInfo = userInfo.userCodyTag;

	userTagInfo.sort(function(a, b) {
	    return parseFloat(b.tagScore) - parseFloat(a.tagScore);
	});

	let tagRank = [];

	for(var i = 0; i < 10; i++){
		tagRank.push(userTagInfo[i].tagName);
	}

	output.msg="success";
	output.data =tagRank;
	output.userToekn = userTokenInfo.userToken;					
	res.json(output); 
}	


//즐겨찾기한  옷보기
exports.clothMybag = async function (req, res, next){
  	let userTokenInfo = await jsonWebToken.TokenCheck(req.body.userToken);
    let userIdCheckdata = { _id: userTokenInfo.ObjectId };
    let userInfo = await UserController.getUserFindObjectId(userIdCheckdata);

	let findData = { _id : ObjectId(userTokenInfo.ObjectId) };
	let showData = {_id : 0 ,userClothMybag : 1};
	let sortData = {_id: -1};
	let codyData = await codyControl.allShowData(User,findData,showData,sortData);
	codyMyBag = codyData[0].userClothMybag;

	let clothData = [];
	let clothInfo = await dbModel.dbOverlap2(category.showCloth,[codyMyBag]);
	for(let i = 0; i< clothInfo.length; i++){
		let   temp = new Object();
		temp.clothName= clothInfo[i].clothName;
		temp.clothPhoto= clothInfo[i].clothPhoto;
		clothData.push(temp);
	}
	let clothObj = new Object();
	clothObj.clothData = clothData;

	output.msg="success";
	output.data =clothObj.clothData;
	output.userToekn = userTokenInfo.userToken						
	res.json(output);
}	


//즐겨찾기한  코디보기
exports.codyMybag = async function (req, res, next){
  	let userTokenInfo = await jsonWebToken.TokenCheck(req.body.userToken);
    let userIdCheckdata = { _id: userTokenInfo.ObjectId };
    let userInfo = await UserController.getUserFindObjectId(userIdCheckdata);

	let findData = { _id : ObjectId(userTokenInfo.ObjectId) };
	let showData = {_id : 0 ,userCodyMybag : 1};
	let sortData = {_id: -1};
	let codyInfo = await codyControl.allShowData(User,findData,showData,sortData);
	temp = [];
	for(let i = 0; i<codyInfo[0].userCodyMybag.length; i++){
		temp.push(ObjectId(codyInfo[0].userCodyMybag[i])) //나중에 push 대신에 concat로 바꿀것. temp.concat(['a','b'])
	}
	
	findData = { _id : { $in: temp }};;
	showData = {_id : 1 ,codyTag : 1,codyPhoto : 1};
	sortData = {_id: -1};
	let result = await codyControl.allShowData(codyModel,findData,showData,sortData);

	output.msg="success";
	output.data=result;
	output.userToekn = userTokenInfo.userToken;						
	res.json(output);
}	

//내가 쓴 게시판 보기(선택) 
exports.showMySelectBoard = async function (req, res, next){
  	let userTokenInfo = await jsonWebToken.TokenCheck(req.body.userToken);
    let userIdCheckdata = { _id: userTokenInfo.ObjectId };
    let userInfo = await UserController.getUserFindObjectId(userIdCheckdata);

	let findData = { selectboardUserId : userInfo.userId };
	let showData = { 
		selectboardRightPhoto : 1, 
		selectboardLeftPhoto : 1,
		selectboardDatetime : 1,
		selectboardContent : 1,
		selectboardRightLike : 1, 
		selectboardLeftLike : 1
	};
	let sortData = { selectboardDatetime: -1};
	let result = await codyControl.allShowData(Select,findData,showData,sortData);

	output.msg="success";
	output.data =result;
	output.userToekn = userTokenInfo.userToken;					
	res.json(output);
  
}	


//내가 쓴 게시판 보기 (일반)
exports.showMyBoard = async function (req, res, next){
  	let userTokenInfo = await jsonWebToken.TokenCheck(req.body.userToken);
    let userIdCheckdata = { _id: userTokenInfo.ObjectId };
    let userInfo = await UserController.getUserFindObjectId(userIdCheckdata);

	var findData = { boardUserId : userInfo.userId };
	var showData = { boardUserId:1 ,boardUserName : 1, boardTodayCount : 1,boardContent : 1,boardPhoto : 1,boardComments : 1, boardLikeUsers : 1};
	var sortData = {_id: -1};
	let result = await codyControl.allShowData(Board,findData,showData,sortData);

	output.msg="success";
	output.data =result;
	output.userToekn = userTokenInfo.userToken;						
	res.json(output);
}	


//유저선호 리스트화면 
exports.userFavoriteList =async  function (req, res, next){	
  	let userTokenInfo = await jsonWebToken.TokenCheck(req.body.userToken);
    let userIdCheckdata = { _id: userTokenInfo.ObjectId };
    let userInfo = await UserController.getUserFindObjectId(userIdCheckdata);
	let codyData = [];

	for(var i = 0; i<userInfo.userFavoriteCodyCheck.length; i++){
		codyData.push(ObjectId(userInfo.userFavoriteCodyCheck[i]));
	}

	let page = req.query.page || 1;
	let count=10;
	let pageCount = (page - 1) * count;
	let findData =		[
		{ $match : { _id:{ $nin : codyData }}},
		{ $project : {
		   	codyTag : 1,
		   	codyPhoto1 : 1,
	   		_id : 1,
	   		}
		},
	   	{ $sort: { _id: -1 }},
		{"$skip":pageCount},
		{"$limit":count}
	];
	let newfavoriteCody = await codyControl.aggregate(codyModel,findData);

	output.msg="success";
	output.data = newfavoriteCody;
	output.userToekn = userTokenInfo.userToken;				
	res.json(output);
}


//선호도 검사 제출  (선호도일때) 
exports.userFavorite = async function (req, res, next){
	let userTokenInfo = await jsonWebToken.TokenCheck(req.body.userToken);
	let userIdCheckdata = { _id: userTokenInfo.ObjectId };
    let userInfo = await UserController.getUserFindObjectId(userIdCheckdata);

	var type = req.params.type;
	var codyId = req.body.codyId;
	var favoriteScore;

	if(type == 'favorite'){
	    favoriteScore = 2;
	}else if(type == 'like'){
		favoriteScore = 1;
	}else{
		favoriteScore = 0;
	}

	if(favoriteScore == 2){
		let findDate = { _id : ObjectId(userTokenInfo.ObjectId) };
		let updateData = { $push: { userCodyMybag: codyId }};
		await codyControl.updateDate(User,findDate,updateData); //favorite면 즐겨찾기에 추가 
	}

	//myShowRoom.codyOverLap ,처음 선호도 검사한 코디 check에 push해준다.
    findData = { _id : ObjectId(userInfo._id)};
    updateData = {$push:{userFavoriteCodyCheck:codyId}};
    await codyControl.updateDate(User,findData,updateData);
    // myShowRoom-codyCategoryData
    //카테고리데이터 가지고온다(Cody) //코디id받아서 카테고리번호를 배열로 개 받는다
   	findData =  { _id : ObjectId(codyId)};
    showData = {_id : 0 ,codyCategoryCode : 1,codyTag : 1};
    sortData = {_id: -1};

    let codyCategory_tag = await codyControl.allShowData(codyModel,findData,showData,sortData);
    let categoryData = codyCategory_tag[0].codyCategoryCode;
    let tagData = codyCategory_tag[0].codyTag;
    let scoreData = [];
    for(let i = 0; i< categoryData.length; i++){                    
        scoreData.push(favoriteScore);
    } 
    //myShowRoom.favoriteInsert
    //category,score 데이터입력 (태그 입력은 따로해야됨)
    //for(var key in categoryData){ 이걸로하면 왜 에러 ?
    for(let key = 0; key<categoryData.length; key++){
        findData = {_id: ObjectId(userInfo._id), userFavorite : 
        { $elemMatch: { favoriteCategoryCode : categoryData[key]}}};
        showData = {"$exists":true};
        sortData = {_id: -1};
        //데이터의 유무만 판단.
        dataExist = await codyControl.allShowData(User,findData,showData,sortData);
         //데이터 0개면 등록
        if(dataExist.length == 0){
            findData = { _id :  ObjectId(userInfo._id)};
            updateData = {$push:{userFavorite:
                 {favoriteCategoryCode: categoryData[key],favoriteScore:scoreData[key]}}};
            await codyControl.updateDate(User,findData,updateData);
        //데이터 있을 시 점수만 올려줌
        }else{
            findData = { _id :  ObjectId(userInfo._id),"userFavorite.favoriteCategoryCode" :categoryData[key]};
            updateData = {'$inc':{"userFavorite.$.favoriteScore" : scoreData[key]}};
            await codyControl.updateDate(User,findData,updateData);
        }
    }
    
    //tag 데이터입력
    //myShowRoom.tagInsert
    var tagScoreData = [];
    for(var i = 0; i< tagData.length; i++){                   
        tagScoreData.push(1);
    } 
    for(var key =0; key<tagData.length; key++){
        findData = {_id: ObjectId(userInfo._id), userCodyTag : 
                 { $elemMatch: { tagName : tagData[key]}}};
        showData = {"$exists":true};
        sortData = {_id: -1};
        //데이터의 유무만 판단
        dataExist = await codyControl.allShowData(User,findData,showData,sortData);

        //데이터 0개면 등록
        if(dataExist.length == 0){
              findData = { _id :  ObjectId(userInfo._id)};
              updateData = {$push:{userCodyTag:
                         {tagName: tagData[key],tagScore:scoreData[key]}}};
              await codyControl.updateDate(User,findData,updateData)
        //데이터 있을 시 점수만 올려줌
        }else{
            findData = { _id :  ObjectId(userInfo._id),"userCodyTag.tagName" :tagData[key]};
            updateData = {'$inc':{"userCodyTag.$.tagScore" : scoreData[key]}};
            await codyControl.updateDate(User,findData,updateData);
        }
    }

	findData = { _id : ObjectId(userInfo._id)};
	showData = { _id : 1 ,userFavoriteCodyCheck : 1};
	sortData = { _id: -1};
	
	let codyInfo = await codyControl.allShowData(User,findData,showData,sortData);
	
	let codyData = [];
	for(var i = 0; i<codyInfo[0].userFavoriteCodyCheck.length; i++){
		codyData.push(ObjectId(codyInfo[0].userFavoriteCodyCheck[i]));
	}
		
	var page = 1;
	var count=10;
	var pageCount = (page - 1) * count;
	var findData =	[
		{ $match : { _id:{ $nin : codyData }}},
		{ $project : 
			{
			   	codyTag : 1,
			   	codyPhoto1 : 1,
			   	codyPhoto2 : 1,
		   		_id : 1,
	   		}
		},
	   	{ $sort: { _id: -1 }},
		{"$skip":pageCount},
		{"$limit":count}
	];

	let result = await codyControl.aggregate(codyModel,findData);
	if(result.length == 0){
		console.log('더이상 검사할 데이터가 존재하지않습니다.');
        return res.status(400).send('더이상 검사할 데이터가 존재하지않습니다.');
		
	}else{
		output.msg="success";
		output.data = result
		output.userToekn = userTokenInfo.userToken
		res.json(output);
	}	
};

//푸시 
exports.pushTest = function (req, res, next){
	async.waterfall(
            [		
    			function(callback){    				
    				var fcm = new FCM(serverKey);
    				var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera) 
    				        to: "caPOM2xycWE:APA91bFXiX8CsgneRvBON7M05WzSGz0BbSzBvpShg5jTRPZWavEqIzsP0ofhkfIJz-URKGhNeZkaboLg2pSBpr4d-NeveJLP1aRXgNN8f66jSAOvQhC002KLH9UsTVxwcviLmA-BUeH9", 
    				        notification: {
    				            title: 'Title of your push notification', 
    				            body: 'Body of your push notification' 
    				        },
    				        data:{
    				        	"Test":"hi"
    				        }
    				    };

    				    fcm.send(message, function(err, response){
    				        if (err) {
    				        	console.log(err);
    				            console.log("Something has gone wrong!");
    				        } else {
    				            console.log("Successfully sent with response: ", response);
    				            callback(null,response)
    				        }
    				    });
    			}
    		],
            function (err, response) {
                if (err) {
            	    err.code = 500;
            	    console.log(err);
            	    res.json({ msg: err });
                }else {
                	output.msg="success";
    				output.data =response;
                	res.json(output);
                }
            });	
}	

exports.codyFilter = function (req, res, next){
	var FCM = require('fcm-push');
	var serverKey = 'AAAAQmprZGs:APA91bHBWAYZnt5u6daqNw3VwNAPHdeGjp5Rz0MvhuNwRTJQvuvLBViQjEBg-0OU5fWpegVibvVj18bZD0Ih_Hx6tfLusmkXc9q6uO738bJg63stUlAKqmPtBzJmf6o8EKp97jxO3WI8'; //put your server key here
	async.waterfall(
            [		
    			function(callback){    				
    				var fcm = new FCM(serverKey);
    				var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera) 
    				        to: "caPOM2xycWE:APA91bFXiX8CsgneRvBON7M05WzSGz0BbSzBvpShg5jTRPZWavEqIzsP0ofhkfIJz-URKGhNeZkaboLg2pSBpr4d-NeveJLP1aRXgNN8f66jSAOvQhC002KLH9UsTVxwcviLmA-BUeH9", 
    				        notification: {
    				            title: 'Title of your push notification', 
    				            body: 'Body of your push notification' 
    				        },
    				        data:{
    				        	"Test":"hi"
    				        }
    				    };

    				    fcm.send(message, function(err, response){
    				        if (err) {
    				        	console.log(err);
    				            console.log("Something has gone wrong!");
    				        } else {
    				            console.log("Successfully sent with response: ", response);
    				            callback(null,response)
    				        }
    				    });
    			}
    		],
            function (err, response) {
                if (err) {
            	    err.code = 500;
            	    console.log(err);
            	    res.json({ msg: err });
                }else {
                	output.msg="success";
    				output.data =response;
                	res.json(output);
                }
            });	
}	
//940