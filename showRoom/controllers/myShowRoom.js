const config=require('config');//
const async =require('async');
const mongoose = require('mongoose');																			
const User=require('../model/Userdb.js');
const codyModel = require('../model/CodyModel.js');
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
const schedule=require('node-schedule');
const mongoHelper=require('../utils/db_mongoose');
const db = mongoHelper.mapReduceDB();

//메인 
exports.main = async function(req, res, next) {
	try {
		let userDegree;
		let page = req.query.page || 1;
		let count=10;
		let pageCount = (page - 1) * count;
		if(req.headers.usertoken == "guest"){
			userDegree = await dbModel.dbOverlap2('select * from weather where city = ?',"Seoul");
		  	let searchCategoryCode = degreeCheck(userDegree[0].tc, 0);
		    let codeRe = new RegExp(searchCategoryCode.deletearray.join("|"));
			var findData = [ 
					{
					"$match": {
		    					"codyCategoryCode": {"$nin": [codeRe]}
		    		}},
					{"$project":
					{
						_id:1,
						codyPhoto:1,
						codyTag: 1,
						shopName: "$codyShopName",
						shopPhoto: "$codyShopPhoto"
					}
				},
				{ "$sample" : { size : count}}, //랜덤으로
				{ "$skip":pageCount},
				{ "$limit":count}
			]
			let codyData = await codyControl.aggregate(codyModel,findData);
			if(codyData == 0){
				output.msg = "fail"
				output.data = null;
			}else{
				output.msg = "success"
				output.data = codyData;
			}
			res.setHeader('userToken',"guest");
			res.json(output);
		}else if(req.headers.usertoken == null){
			output.msg = "success"
			output.data = null;
			res.json(output);
		}else if(req.headers.usertoken == undefined) {
			output.msg = "success"
			output.data = null;
			res.json(output);
		}else{
			let userTokenInfo = await jsonWebToken.TokenCheck(req.headers.usertoken);
		    let userIdCheckdata = { _id: userTokenInfo.ObjectId };

		    let userquery = [
		    	{
		    		"$project": {
		    			userLocal: 1,
		    			userCodyMybag: 1,
		    			userCodyTagarray: {
		    				"$map": { // 유저코디태그를 나눔
		    					input: "$userCodyTag", //디비컬럼참조
		    					as: 'usercodytags', // 새로운 컬럼생성 (잠깐)
		    					in: { // 배열안에 tag랑 score을 만듦
		    						Tag: "$$usercodytags.tagName",
		    						score: "$$usercodytags.tagScore"
		    					}
		    				}
		    			},
		    			userCategoryarray: {
		    				"$map": {
		    					input: "$userFavorite",
		    					as: 'userFavorites',
		    					in: {
		    						categoryCode: "$$userFavorites.favoriteCategoryCode",
		    						score: "$$userFavorites.favoriteScore"
		    					}
		    				}
		    			}
		    		}
		    	},
		    	{
		    		"$match": { _id: ObjectId(userTokenInfo.ObjectId)}
		    	}
		    ];
		    let arraytag = [];
		    let arrayCategoryCode = [];
		    let userCategoryTagInfo = await UserController.userAggregate(userquery);
		    
		    if(userCategoryTagInfo.userFavorite == 0){
		    	userDegree = await dbModel.dbOverlap2('select * from weather where city = ?',"Seoul");
			  	let searchCategoryCode = degreeCheck(userDegree[0].tc, 0);
			    let codeRe = new RegExp(searchCategoryCode.deletearray.join("|"));
				var findData = [ 
						{
						"$match": {
			    					"codyCategoryCode": {"$nin": [codeRe]}
			    		}},
						{"$project":
						{
							_id:1,
							codyPhoto:1,
							codyTag: 1,
							shopName: "$codyShopName",
							shopPhoto: "$codyShopPhoto"
						}
					},
					{ "$sample" : { size : count}}, //랜덤으로
					{ "$skip":pageCount},
					{ "$limit":count}
				]
				let codyData = await codyControl.aggregate(codyModel,findData);
				if(codyData == 0){
					output.msg = "fail"
					output.data = null;
				}else{
					output.msg = "success"
					output.data = codyData;
				}
		    }
		    else{
			    userDegree = await dbModel.dbOverlap2('select * from weather where city = ?',userCategoryTagInfo.userLocal);
			    for(var i=0; i<userCategoryTagInfo.userFavorite.length; i++){
			    	if(userCategoryTagInfo.userFavorite[i].Tag){
			    		arraytag.push(userCategoryTagInfo.userFavorite[i].Tag)
			    	}
			    	else{
			    		arrayCategoryCode.push(userCategoryTagInfo.userFavorite[i].categoryCode);
			    	}
			    }
			    let searchCategoryCode = degreeCheck(-10, arrayCategoryCode);
			    let codeRe = new RegExp(searchCategoryCode.deletearray.join("|"));

			    let codyfindquery1 = [
			    	{
			    		"$match": {
			    			"$or": [
			    				{
			    					"codyCategoryCode": {"$in": searchCategoryCode.searcharray}
			    				}
			    			]
			    		}
			    	},
			    	{
			    		"$addFields": { //새로운필드를 만듦 (잠깐쓸려고)
			    			"userFavoriteTagCategory": userCategoryTagInfo.userFavorite //태그랑 코드 합친거 
			    		}
			    	},
			    	{
			    		"$project": {
			    			_id: 1,
			    			codyPhoto1: {"$split": ["$codyPhoto", "origin"]},
			    			codyShopName: 1,
			    			codyShopPhoto: 1,
			    			codyCategoryCode: 1,
			    			codyTag: 1,
			    			userFavoriteCategory: 1,
			    			userIsStar :  { $in: [ "$_id", { $literal: userCategoryTagInfo.userCodyMybag } ] },
			    			userCodyscoreArray: {
			    				"$map": {
			    					"input": "$userFavoriteTagCategory", //유저가 갖고있는 코디 
			    					"as": "userFavoriteCategorycompare",
			    					"in": {
			    						"$cond": [ //if문 참이면 "$$userFavoriteCategorycompare.score", 아니면 0
			    							{
			    								"$anyElementTrue": { //true냐 fasle를 판별 값있나없나나
			    									"$map": { // for문
			    										"input": "$codyCategoryCode", //해당 코디꺼 
			    										"as": "codyCategoryCodecompare",
			    										"in": {"$eq": ["$$userFavoriteCategorycompare.categoryCode", "$$codyCategoryCodecompare"]}
			    									}
			    								}
			    							},
			    							"$$userFavoriteCategorycompare.score", //true
			    							0//false
			    						]
			    					}
			    				}
			    			},
			    			userTagscoreArray: {
			    				"$map": {
			    					"input": "$userFavoriteTagCategory",
			    					"as": "userFavoriteTagcompare",
			    					"in": {
			    						"$cond": [
			    							{
			    								"$anyElementTrue": {
			    									"$map": {
			    										"input": "$codyTag",
			    										"as": "codyTagcompare",
			    										"in": {"$eq": ["$$userFavoriteTagcompare.Tag", "$$codyTagcompare"]}
			    									}
			    								}
			    							},
			    							"$$userFavoriteTagcompare.score",
			    							0
			    						]
			    					}
			    				}
			    			}
			    		}
			    	},
			    	{
			    		"$unwind": "$codyPhoto1"
			    	},
					{
			    		"$group": {
			    			_id: "$_id",
			    			codyPhotofirst: {"$first": "$codyPhoto1"},
			    			codyPhotolast: {"$last": "$codyPhoto1"},
			    			codyShopName: {"$first": "$codyShopName"},
			    			codyShopPhoto: {"$first": "$codyShopPhoto"},
			    			codyTag: {"$first": "$codyTag"},
			    			userIsStar: {"$first": "$userIsStar"},
			    			userTagscoreArray: {"$first": "$userTagscoreArray"},
			    			userCodyscoreArray: {"$first": "$userCodyscoreArray"}
			    		}
			    	},
			    	{
			    		"$project": {
			    			_id: 1,
			    			codyPhoto: {"$concat": ["$codyPhotofirst","thumbnail","$codyPhotolast"]},
			    			codyShopName: 1,
			    			codyShopPhoto: 1,
			    			codyTag: 1,
			    			userIsStar: 1,
			    			userTagscore: { "$sum": "$userTagscoreArray"}, // 태그 합친거 
			    			userCodyscore: { "$sum": "$userCodyscoreArray"} // 코디점수
			    		}
			    	},
			    	{
			    		"$project": {
			    			_id: 1,
			    			codyPhoto: 1,
			    			shopName: "$codyShopName",
			    			shopPhoto: "$codyShopPhoto",
			    			userIsStar: 1,
			    			codyTag: 1,
			    			totalScore: { "$sum": ["$userTagscore", "$userCodyscore"]} //종합 코디랑 
			    		}
			    	},
			    	{"$match": {"codyCategoryCode": {"$nin": [codeRe]}}},
			    	{"$match": {"userIsStar": false}},
			    	{"$sort": {"totalScore": -1}},
			    	{"$skip":pageCount},
					{"$limit":count}
			    ];
			    let userCodyResults = await codyControl.aggregate1(codyModel,codyfindquery1);
			    output.msg = "sucess";
			    output.data = userCodyResults;
		    }
		    res.setHeader('userToken', userTokenInfo.userToken);
		    res.json(output);
		}
		
	}catch(e) {
		output.msg = 'fail';
		output.data = e.message;
		res.setHeader('userToken',req.headers.usertoken);
		res.json(output);
	}
}

//유저 태그 1~10 순위 
exports.userFavoriteTag = async function (req, res, next){ // 안드로이드 안맞춤 
	try{
		if(req.headers.usertoken == "guest"){
			output.msg = "success";
			res.setHeader('userToken',"guest");
			res.json(output);
		}else if(req.headers.usertoken == null){
			output.msg = "success";
			output.data = null;
			res.json(output);
		}else if(req.headers.usertoken == undefined) {
			output.msg = "success";
			output.data = null;
			res.json(output);
		}else{
			let userTokenInfo = await jsonWebToken.TokenCheck(req.headers.usertoken);
		    let userIdCheckdata = { _id: userTokenInfo.ObjectId };
			let userInfo = await UserController.getUserFindObjectId(userIdCheckdata);
			let userTagInfo = userInfo.userCodyTag;
			let userPhotoInfo = userInfo.userPhoto;
			if(userTagInfo == 0){
				output.msg="fail";
				output.data =null;
			}else{
				userTagInfo.sort(function(a, b) {
				    return parseFloat(b.tagScore) - parseFloat(a.tagScore);
				});

				let tagRank = [];
				if(userTagInfo.length < 10){
					for(var i = 0; i < userTagInfo.length; i++){
						tagRank.push(userTagInfo[i].tagName);
					}
				}else{
					for(var i = 0; i < 10; i++){
						tagRank.push(userTagInfo[i].tagName);
					}
				}
				let myRoomData = {};
				myRoomData.tagRank =  tagRank;
				myRoomData.userPhoto =  userPhotoInfo;
				output.msg="success";
				output.data = myRoomData;
			}
			res.setHeader('userToken', userTokenInfo.userToken);					
			res.json(output);
		}
	}catch(e) {
		output.msg = 'fail';
		output.data = e.message;
		res.setHeader('userToken',req.headers.usertoken);
		res.json(output);
	}
}	


//즐겨찾기한  옷보기(아마존 수정완료)
exports.clothMybag = async function (req, res, next){
	try{
		if(req.headers.usertoken == "guest"){
			output.msg = "success";
			res.setHeader('userToken',"guest");
			res.json(output);
		}else if(req.headers.usertoken == null){
			output.msg = "success";
			output.data = null;
			res.json(output);
		}else if(req.headers.usertoken == undefined) {
			output.msg = "success";
			output.data = null;
			res.json(output);
		}else{
		  	let userTokenInfo = await jsonWebToken.TokenCheck(req.headers.usertoken);
		    let userIdCheckdata = { _id: userTokenInfo.ObjectId };
		    let userInfo = await UserController.getUserFindObjectId(userIdCheckdata);
			let findData = { _id : ObjectId(userTokenInfo.ObjectId) };
			let showData = {_id : 0 ,userClothMybag : 1};
			let sortData = {_id: -1};
			let codyData = await codyControl.allShowData(User,findData,showData,sortData);
			codyMyBag = codyData[0].userClothMybag;
			if(codyMyBag ==0 ){
				output.msg="not exist Data";
				output.data =null;
			}else{
				let clothData = [];
				let clothInfo = await dbModel.dbOverlap2(category.showCloth_shopPhoto,[codyMyBag]);
				
				for(let i = 0; i< clothInfo.length; i++){
					let   temp = new Object();
					temp.clothNumber= clothInfo[i].clothnumber;
					temp.clothName= clothInfo[i].clothname;
					temp.clothUrl= clothInfo[i].clothUrl;
					temp.clothPhoto= clothInfo[i].clothphoto;
					temp.shopName= clothInfo[i].shopname;
					temp.shopPhoto= clothInfo[i].shopphoto;
					clothData.push(temp);
				}

				output.msg="success";
				output.data =clothData;
			}
			res.setHeader('userToken', userTokenInfo.userToken);
			res.json(output);	
		}				
	}catch(e){
		output.msg = 'fail';
		output.data = e.message;
		res.setHeader('userToken',req.headers.usertoken);
		res.json(output);
	}
}	


//즐겨찾기한  코디보기(아마존 완료)
exports.codyMybag = async function (req, res, next){
	try{
		if(req.headers.usertoken == "guest"){
			output.msg = "success";
			res.setHeader('userToken',"guest");
			res.json(output);
		}else if(req.headers.usertoken == null){
			output.msg = "success";
			output.data = null;
			res.json(output);
		}else if(req.headers.usertoken == undefined){
			output.msg = "success";
			output.data = null;
			res.json(output);
		}else{
			let userTokenInfo = await jsonWebToken.TokenCheck(req.headers.usertoken);
		    let userIdCheckdata = { _id: userTokenInfo.ObjectId };
		    let userInfo = await UserController.getUserFindObjectId(userIdCheckdata);
			let findData = { _id : ObjectId(userTokenInfo.ObjectId) };
			let showData = {_id : 0 ,userCodyMybag : 1};
			let sortData = {_id: -1};
			let codyInfo = await codyControl.allShowData(User,findData,showData,sortData);
			if(codyInfo ==0 ){
				output.msg="not exist Data";
				output.data =null;
			}else{
				temp = [];
				for(let i = 0; i<codyInfo[0].userCodyMybag.length; i++){
					temp.push(ObjectId(codyInfo[0].userCodyMybag[i])) //나중에 push 대신에 concat로 바꿀것. temp.concat(['a','b'])
				}
				findData = { _id : { $in: temp }};;
				showData = {_id : 1 ,codyTag : 1, codyPhoto : 1, codyShopName : 1, codyShopPhoto : 1};
				sortData = {_id: -1};
				let result = await codyControl.allShowData(codyModel,findData,showData,sortData);
				output.msg="success";
				output.data=result;
			}
			res.setHeader('userToken', userTokenInfo.userToken);					
			res.json(output);
		}
	}catch(e){
		output.msg = 'fail';
		output.data = e.message;
		res.setHeader('userToken',req.headers.usertoken);
		res.json(output);
	}
}	

//내가 쓴 게시판 보기(선택) 
exports.showMySelectBoard = async function (req, res, next){
	try{
		if(req.headers.usertoken == "guest"){
			output.msg = "success";
			res.setHeader('userToken',"guest");
			res.json(output);
		}else if(req.headers.usertoken == null){
			output.msg = "success";
			output.data = null;
			res.json(output);
		}else if(req.headers.usertoken == undefined) {
			output.msg = "success";
			output.data = null;
			res.json(output);
		}else{
			let userTokenInfo = await jsonWebToken.TokenCheck(req.headers.usertoken);
		    let userIdCheckdata = { _id: userTokenInfo.ObjectId };
		    let userInfo = await UserController.getUserFindObjectId(userIdCheckdata);
			let findData = { selectboardUserId : userInfo.userId };
			let showData = { 
				_id : 1,
				selectboardRightPhoto : 1, 
				selectboardLeftPhoto : 1,
				selectboardContent : 1,
				selectboardName : 1,
				selectboardRightLike: 1,
				selectboardLeftLike : 1
			};
			let sortData = { selectboardDatetime: -1};
			let result = await codyControl.allShowData(Select,findData,showData,sortData);
			if(result ==0){
				output.msg="not exist Data";
				output.data =null;
			}else{
				output.msg="success";
				output.data =result;
			}
			res.setHeader('userToken', userTokenInfo.userToken);					
			res.json(output);
		}
	}catch(e){
		output.msg = 'fail';
		output.data = e.message;
		res.setHeader('userToken',req.headers.usertoken);
		res.json(output);
	}
}	


//내가 쓴 게시판 보기 (일반)
exports.showMyBoard = async function (req, res, next){
	try{
		if(req.headers.usertoken == "guest"){
			output.msg = "success";
			res.setHeader('userToken',"guest");
			res.json(output);
		}else if(req.headers.usertoken == null){
			output.msg = "success";
			output.data = null;
			res.json(output);
		}else if(req.headers.usertoken == undefined) {
			output.msg = "success";
			output.data = null;
			res.json(output);
		}else{
			let userTokenInfo = await jsonWebToken.TokenCheck(req.headers.usertoken);
		    let userIdCheckdata = { _id: userTokenInfo.ObjectId };
		    let userInfo = await UserController.getUserFindObjectId(userIdCheckdata);

			var findData = { boardUserId : userInfo.userId };
			var showData = { _id : 1,boardUserName : 1,boardPhoto : 1,boardName:1, boardUserPhoto : 1};
			var sortData = {_id: -1};
			let result = await codyControl.allShowData(Board,findData,showData,sortData);
			if(result ==0){
				output.msg="not exist Data";
				output.data =null;
			}else{
				output.msg="success";
				output.data =result;
			}
			res.setHeader('userToken', userTokenInfo.userToken);					
			res.json(output);
		}
	}catch(e){
		output.msg = 'fail';
		output.data = e.message;
		res.setHeader('userToken',req.headers.usertoken);
		res.json(output);
	}
}	


//유저선호 리스트화면 
exports.userFavoriteList =async  function (req, res, next){	
	try{
		if(req.headers.usertoken == "guest"){
			output.msg = "success";
			res.setHeader('userToken',"guest");
			res.json(output);
		}else if(req.headers.usertoken == null){
			output.msg = "success";
			output.data = null;
			res.json(output);
		}else if(req.headers.usertoken == undefined) {
			output.msg = "success";
			output.data = null;
			res.json(output);
		}else{
			let userTokenInfo = await jsonWebToken.TokenCheck(req.headers.usertoken);
		    let userIdCheckdata = { _id: userTokenInfo.ObjectId };
		    let userInfo = await UserController.getUserFindObjectId(userIdCheckdata);
			let codyData = [];

			for(var i = 0; i<userInfo.userFavoriteCodyCheck.length; i++){
				codyData.push(ObjectId(userInfo.userFavoriteCodyCheck[i]));
			}

			let page = req.query.page || 1;
			let count=4;
			let pageCount = (page - 1) * count;
			let findData =		[
				{ $match : { _id:{ $nin : codyData }}},
				{ $project : {
				   	codyPhoto : 1,
			   		_id : 1,
			   		}
				},
			   	{ "$sample" : { size : count}}, //랜덤으로
				{"$skip":pageCount}
				//{"$limit":count} // 랜덤 
			];
			let newfavoriteCody = await codyControl.aggregate(codyModel,findData);
			if(newfavoriteCody == 0){
				output.msg="fail";
				output.data = null;
			}else{
				output.msg="success";
				output.data = newfavoriteCody;
			}
			res.setHeader('userToken', userTokenInfo.userToken);		
			res.json(output);
		}
	}catch(e){
		output.msg = 'fail';
		output.data = e.message;
		res.setHeader('userToken',req.headers.usertoken);
		res.json(output);
	}
}


//선호도 검사 제출  (선호도일때) 
exports.userFavorite = async function (req, res, next){
	try{
		if(req.headers.usertoken == "guest"){
			output.msg = "success";
			res.setHeader('userToken',"guest");
			res.json(output);
		}else if(req.headers.usertoken == null){
			output.msg = "success";
			output.data = null;
			res.json(output);
		}else if(req.headers.usertoken == undefined) {
			output.msg = "success";
			output.data = null;
			res.json(output);
		}else{
			let userTokenInfo = await jsonWebToken.TokenCheck(req.headers.usertoken);
			let userIdCheckdata = { _id: userTokenInfo.ObjectId };
		    let userInfo = await UserController.getUserFindObjectId(userIdCheckdata);

			let type = req.params.type;
			let codyId = req.body.codyId;
			let favoriteScore;

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
		        findData = {_id: ObjectId(userInfo._id), userCodyTag : { $elemMatch: { tagName : tagData[key]}}};
		        showData = {"$exists":true};
		        sortData = {_id: -1};        
		        let dataExist = await codyControl.allShowData(User,findData,showData,sortData);

		        //데이터 0개면 등록
		        if(dataExist.length == 0){
		              findData = { _id :  ObjectId(userInfo._id)};
		              updateData = {$push:{userCodyTag:
		                         {tagName: tagData[key],tagScore:tagScoreData[key]}}};
		              await codyControl.updateDate(User,findData,updateData)
		        //데이터 있을 시 점수만 올려줌
		        }else{
		            findData = { _id :  ObjectId(userInfo._id),"userCodyTag.tagName" :tagData[key]};
		            updateData = {'$inc':{"userCodyTag.$.tagScore" : tagScoreData[key]}};
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
			var saveCheck = req.body.saveCheck;

			if(saveCheck == true){
				var page = 1;
				var count=4;
				var pageCount = (page - 1) * count;
				var findData =	[
					{ $match : { _id:{ $nin : codyData }}},
					{ $project : 
						{
						   	codyPhoto : 1,
					   		_id : 1,
				   		}
					},
					{ "$sample" : { size : count}}, //랜덤으로
				   	{ $sort: { _id: -1 }},
					{"$skip":pageCount}
					// {"$limit":count} // 랜덤 
				];
				let result = await codyControl.aggregate(codyModel,findData);
				
				if(result.length == 0){
					output.msg="fail";
					output.data = null;
				}else{
					output.msg="newSuccess";
					output.data = result
				}
			}else{
				output.msg="success";
				output.data = null;
			}

			res.setHeader('userToken', userTokenInfo.userToken);			
			res.json(output);
		}
	}catch(e){
		output.msg = 'fail';
		output.data = e.message;
		res.setHeader('userToken',req.headers.usertoken);
		res.json(output);
	}
}


	// 나이대별 코디순위 
exports.findCodyAgeRank =async function (req, res, next) {
	try{
		const age = req.query.age;
		let data ;
		if(age == '10'){
			data = await findCody10Rank();
		}else if(age == '20'){
			data = await findCody20Rank();
		}else if(age == '30'){
			data = await findCody30Rank();
		}else if(age == '40'){
			data = await findCody40Rank();
		}else{
			data = await findCodyRank();
		}
		if(data == 0){
			output.msg = 'fail';
			output.data = null;
		}else{
			output.msg = 'success';
			output.data = data;
		}
		res.send(output);
	}catch(e){
		output.msg = 'fail';
		output.data = e.message;
		res.json(output);
	}
};


// 코디인기 순위 
function findCodyRank(){
 	return new Promise(function(resolve, reject){
		codyData = [];
		db.codyRanking.find().sort({ value: -1 },function(err,result){
			if(result == 0){
				codyData =null;
				resolve(codyData);
			}else if(result.length < 10){
				result.forEach(function(results){
					var temp = {};
					temp._id = results._id._id;
					temp.photo = results._id.photo;
					codyData.push(temp);
				})
				resolve(codyData);
			}else{
				for(var i = 0; i < 10 ; i++){
					var temp = {};
					temp._id = result[i]._id._id;
					temp.photo = result[i]._id.photo;
					codyData.push(temp)
				}
				resolve(codyData);
			}
		});
	})
};



// 쇼핑몰 순위 
exports.findShopRank = function (req, res, next) { // 안드로이드 안맞춤 
	shopData = [];
	db.shopRanking.find().sort({ value: -1 },function(err,result){
		if(result == 0){
			output.msg = 'fail' ;
			output.data = null;
		}else if(result.length < 10){
			result.forEach(function(results){
				var temp = {};
				temp.shopName = results._id.shopName;
				temp.shopPhoto = results._id.shopPhoto;
				temp.shopUrl = results._id.shopUrl;
				shopData.push(temp);
			})
			output.msg = 'success' ;
			output.data = shopData;
		}else{
			for(var i = 0; i < 10 ; i++){
				var temp = {};
				temp.shopName = result[0]._id.shopName;
				temp.shopPhoto = result[0]._id.shopPhoto;
				temp.shopUrl = result[0]._id.shopUrl;
				shopData.push(temp)
			}
			output.msg = 'success' ;
			output.data = shopData;
		}
		res.send(output);
	});
};

// 10~40대 함수 
// 10대 순위 
 function findCody10Rank(){
 	return new Promise(function(resolve, reject){
		codyData = [];
		db.cody10Ranking.find().sort({ value: -1 },function(err,result){
			if(result == 0){
				codyData =null;
				resolve(codyData);
			}else if(result.length < 10){
				result.forEach(function(results){
					var temp = {};
					temp._id = results._id._id;
					temp.photo = results._id.photo;
					codyData.push(temp);
				})
				resolve(codyData);
			}else{
				for(var i = 0; i < 10 ; i++){
					var temp = {};
					temp._id = result[i]._id._id;
					temp.photo = result[i]._id.photo;
					codyData.push(temp)
				}
				resolve(codyData);
			}
		});
	})
};

// 20대 순위 
 function findCody20Rank(){
 	return new Promise(function(resolve, reject){
		codyData = [];
		db.cody20Ranking.find().sort({ value: -1 },function(err,result){
			if(result == 0){
				codyData =null;
				resolve(codyData);
			}else if(result.length < 10){
				result.forEach(function(results){
					var temp = {};
					temp._id = results._id._id;
					temp.photo = results._id.photo;
					codyData.push(temp);
				})
				resolve(codyData);
			}else{
				for(var i = 0; i < 10 ; i++){
					var temp = {};
					temp._id = result[i]._id._id;
					temp.photo = result[i]._id.photo;
					codyData.push(temp)
				}
				resolve(codyData);
			}
		});
	})
};

// 30대 순위 
 function findCody30Rank(){
 	return new Promise(function(resolve, reject){
		codyData = [];
		db.cody30Ranking.find().sort({ value: -1 },function(err,result){
			if(result == 0){
				codyData =null;
				resolve(codyData);
			}else if(result.length < 10){
				result.forEach(function(results){
					var temp = {};
					temp._id = results._id._id;
					temp.photo = results._id.photo;
					codyData.push(temp);
				})
				resolve(codyData);
			}else{
				for(var i = 0; i < 10 ; i++){
					temp._id = result[i]._id._id;
					temp.photo = result[i]._id.photo;
					codyData.push(temp)
				}
				resolve(codyData);
			}
		});
	})
};


// 40대 순위 
 function findCody40Rank(){
 	return new Promise(function(resolve, reject){
		codyData = [];
		db.cody40Ranking.find().sort({ value: -1 },function(err,result){
			if(result == 0){
				codyData =null;
				resolve(codyData);
			}else if(result.length < 10){
				result.forEach(function(results){
					var temp = {};
					temp._id = results._id._id;
					temp.photo = results._id.photo;
					codyData.push(temp);
				})
				resolve(codyData);
			}else{
				for(var i = 0; i < 10 ; i++){
					var temp = {};
					temp._id = result[i]._id._id;
					temp.photo = result[i]._id.photo;
					codyData.push(temp)
				}
				resolve(codyData);
			}
		});
	})
};


//여기서 부터는 스케쥴러 
exports.codyRank = async function (req, res, next){
	var o = {};
	var key
	o.map = function(){
		key = { 
			_id : this._id,
            photo : this.codyPhoto
        }
		emit(key,this.codyUserClickAge.length);
	}

	o.reduce = function(key,values){
		return Array.sum(values);
	};
	
	o.out = {
		replace: 'codyRanking'
	};
	
	o.verbose = true;
	let codyRank = await myShowRoom.codyRank(codyModel,o);
	return;
};


//쇼핑몰 순위
exports.shopRank = async function (req, res, next) {
	var o = {};
	var key
	o.map = function(){
		key = { 
            shopName : this.codyShopName,
            shopPhoto : this.codyShopPhoto,
            shopUrl : this.codyShopUrl
        }
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
	return ;
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
	return ;
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
	return ;
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
	return ;
};



//40대 코디 순위
exports.cody40Rank = async function (req, res, next) {
	var o = {};
	var key;
	o.map = function(){
		for(index in this.codyUserClickAge){
			if(this.codyUserClickAge[index]>39 || this.codyUserClickAge[index]<10){
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
	return ;
};


//온도체크
function degreeCheck(degree,categoryCode) {
	var searcharray = [];
	var deletearray = [];
	var unCode = [];
	var userCategoryarray;
	switch(degree){
			case -32 : case -31 : case -30 : case -29 : case -28 : case -27 :
			case -26 : case -25 : case -24 : case -23 : case -22 : case -21 :
			case -20 : case -19 : case -18 : case -17 : case -16 : case -15 :
			case -14 : case -13 : case -12 : case -11 : case -10 : case -9 : 
			case -8 : case -7 : case -6 : case -5 : //31 빼
				unCode = ['^31', '^50'];
				for(let i=0; i<categoryCode.length; i++) {
					var check31 = categoryCode[i].startsWith("31");
					var check50 = categoryCode[i].startsWith("50");
					if(check31 == true || check50 == true) {}
			    	else {
			    		searcharray.push(categoryCode[i]);
			    	}
				}
				userCategoryarray = {
					searcharray: searcharray,
					deletearray: unCode
				}
				return userCategoryarray;
				break;
			case -4 : case -3 : case -2 : case -1 : case 1 :  case 2 : case 3 : case 4 :
			case 5 : case 6 : case 7 : case 8 : case 9 : case 10 : // 10,31 뺴 
				unCode = ['^31','^10', '^50'];
				for(let i=0; i<categoryCode.length; i++) {
					var check31 = categoryCode[i].startsWith("31");
					var check10 = categoryCode[i].startsWith("10");
					var check50 = categoryCode[i].startsWith("50");
					if(check31 == true || check10 == true || check50 == true) {}
			    	else {
			    		searcharray.push(categoryCode[i]);
			    	}
				}
				userCategoryarray = {
					searcharray: searcharray,
					deletearray: unCode
				}
				return userCategoryarray;
				break;
			case 11 : case 12 : case 13 : case 14 : case 15 :  // 10,20,31 빼
				unCode = ['^31','^10','^20', '^50'];
				for(let i=0; i<categoryCode.length; i++) {
					var check31 = categoryCode[i].startsWith("31");
					var check10 = categoryCode[i].startsWith("10");
					var check20 = categoryCode[i].startsWith("20");
					var check50 = categoryCode[i].startsWith("50");
					if(check31 == true || check10 == true || check20 == true || check50 == true) {}
			    	else {
			    		searcharray.push(categoryCode[i]);
			    	}
				}
				userCategoryarray = {
					searcharray: searcharray,
					deletearray: unCode
				}
				return userCategoryarray;
				break;
			case 16 : case 17 : case 18 : case 19 : case 20 : case 21 : case 22 :
			case 23 : case 24 : case 25 : // 10,11,20,31 뺴
				unCode = ['^31','^10','^20','^11','^50'];
				for(let i=0; i<categoryCode.length; i++) {
					var check31 = categoryCode[i].startsWith("31");
					var check10 = categoryCode[i].startsWith("10");
					var check20 = categoryCode[i].startsWith("20");
					var check11 = categoryCode[i].startsWith("11");
					var check50 = categoryCode[i].startsWith("50");
					if(check31 == true || check10 == true || check20 == true || check11 == true || check50 == true) {}
			    	else {
			    		searcharray.push(categoryCode[i]);
			    	}
				}
				userCategoryarray = {
					searcharray: searcharray,
					deletearray: unCode
				}
				return userCategoryarray;
				break;
			default : //여름용 
				unCode = ['^10','^11','^20','^21'];
				for(let i=0; i<categoryCode.length; i++) {
					var check30 = categoryCode[i].startsWith("30");
					var check11 = categoryCode[i].startsWith("31");
					var check22 = categoryCode[i].startsWith("22");
					var check40 = categoryCode[i].startsWith("40");
					var check50 = categoryCode[i].startsWith("50");
					var check60 = categoryCode[i].startsWith("60");
					var check61 = categoryCode[i].startsWith("61");
					var check62 = categoryCode[i].startsWith("62");
					if(check40 == true || check30 == true || check11 == true || check22 == true || check50 == true || check60 == true || check61 == true || check62 == true) {
						searcharray.push(categoryCode[i]);
					}
					else {}
				}
				userCategoryarray = {
					searcharray: searcharray,
					deletearray: unCode
				}
				return userCategoryarray;
				break;
		}
}	