const config=require('config');//
const mongoose = require('mongoose');																			
const codyModel = require('../model/CodyModel.js');
const User=require('../model/Userdb.js');
const async = require('async');	
const shop = require('../utils/shopController'); 
const myShowRoom = require('../utils/myShowRoomController');
const category = require('../utils/categoryController');  
const codyControl = require('../utils/codyController');
const ObjectId = require('mongodb').ObjectID;
const UserController=require('../utils/userController');
const jsonWebToken=require('../utils/jsonWebToken');
const dbModel = require('../utils/dbOverlap');
const output = new Object;
const fs=require('fs');


//코디 등록
exports.addCody = async  function (req, res, next){
    let shopTokenInfo = await jsonWebToken.TokenCheck(req.body.shopToken);
  	let cody = new codyModel();  
  	let PhotoFile=req.files[0];

  	if(PhotoFile){
  		  cody.codyPhoto = config.Customer.imageurl+PhotoFile.destination.substr(8,PhotoFile.destination.length)+'/'+PhotoFile.filename;
  	}else{
  		  console.log('codyPhoto must Insert!!!!!!!!!!!!');
  	    return res.status(400).send('codyPhoto must Insert!!!!!!!!!!!!');
  	}
  	cody.codyDegree = parseInt(req.body.codyDegree);
  	cody.codyPrice = parseInt(req.body.codyPrice);
  	
  	let codyTagArrary = req.body.codyTag;
  	let codyTag = codyTagArrary.split(',');
  	cody.codyTag = codyTag;

  	let codyWeatherArray = req.body.codyWeather;
  	let codyWeather = codyWeatherArray.split(',');
  	cody.codyWeather = codyWeather;
  	
  	let codyScheduleContentArray = req.body.codyScheduleContent;
  	let codyScheduleContent = codyScheduleContentArray.split(',');
  	cody.codyScheduleContent = codyScheduleContent; 
  	
  	let codyCategoryCodeArray = req.body.codyCategoryCode;
  	let codyCategoryCode = codyCategoryCodeArray.split(',');
  	cody.codyCategoryCode = codyCategoryCode; 
  	
  	let codyClothArray = req.body.codyClothNumber;
  	let codyCloth = codyClothArray.split(',');
  	cody.codyClothNumber = codyCloth;

    let shopData = await dbModel.dbOverlap2(shop.findShopName,shopTokenInfo.ObjectId)
    if(shopData.length >0){
        cody.codyShopName = shopTokenInfo.ObjectId;
        cody.codyShopPhoto = shopData[0].shopPhoto
        await codyControl.addDate(cody);
    }else{
        console.log('shopPhoto not exist !!!!!!!!!!!!');
        return res.status(400).send('shopPhoto not exist !!!!!!!!!!!!');
    } 
  	output.msg = 'cody Insert success';
  	output.shopToken = shopTokenInfo.userToken;
  	res.json(output);
};


//코디수정
exports.editCody = async function (req, res, next){
    let shopInfo = await jsonWebToken.TokenCheck(req.body.shopToken);
      
    let codyId = req.params.codyId;
        codyId = { _id : ObjectId(codyId)};
    let PhotoFile=req.files[0];

  	let codyWeatherArray = req.body.codyWeather;
  	let codyWeather = codyWeatherArray.split(',');
  	
  	let codyScheduleContentArray = req.body.codyScheduleContent;
  	let codyScheduleContent = codyScheduleContentArray.split(',');
  	
  	let codyCategoryCodeArray = req.body.codyCategoryCode;
  	let codyCategoryCode = codyCategoryCodeArray.split(',');
  	
  	let codyClothArray = req.body.codyClothNumber;
  	let codyCloth = codyClothArray.split(',');
	
  	let codyTagArrary = req.body.codyTag;
  	let codyTag = codyTagArrary.split(',');
  	
  	let codyInfo = {
  		  codyTag : codyTag,
  		  codyWeather : codyWeather,
  		  codyDegree : parseInt(req.body.codyDegree),
    		codyPrice : parseInt(req.body.codyPrice),
    		codyScheduleContent :  codyScheduleContent,
    		codyClothNumber : codyCloth,
    		codyCategoryCode : codyCategoryCode
  	}
    if(PhotoFile){
        codyInfo.codyPhoto = config.Customer.imageurl+PhotoFile.destination.substr(8,PhotoFile.destination.length)+'/'+PhotoFile.filename;
    }

    let shopData = await dbModel.dbOverlap2(shop.findShopName,shopInfo.ObjectId)
    
    if(shopData.length >0){
        shopPhoto = shopData[0].shopPhoto
    }else{
        console.log('shopPhoto not exist !!!!!!!!!!!!');
        return res.status(400).send('shopPhoto not exist !!!!!!!!!!!!');
    }
          
    if(PhotoFile){
        let codyData = await codyControl.showData(codyModel,codyId);
        let photo = 'public/'+codyData[0].codyPhoto.substr(15, codyData[0].codyPhoto.length); //26
        fs.unlink( photo, function (err) {
            if (err){ 
                console.log('파일 삭제 실패 :',err);
            }else{
                console.log('codyPhoto 파일 삭제 완료');
            } 
        });
    } 
    codyInfo.codyShopName = shopInfo.ObjectId;
		codyInfo.codyShopPhoto = shopPhoto;
		let findDate = codyId;
		let updateData = {$set:codyInfo};
		await codyControl.updateDate(codyModel,findDate,updateData);

	  output.msg = 'cody edit success';
	  output.shopToken = shopInfo.userToken;
	  res.json(output);
};


//코디삭제
exports.removeCody = async function (req,res,next){  
  	let shopInfo = await jsonWebToken.TokenCheck(req.body.shopToken);
  	let codyId = req.params.codyId;
	      codyId = { _id : ObjectId(codyId)};

    let codyData = await codyControl.showData(codyModel,codyId);
    let photo = 'public/'+codyData[0].codyPhoto.substr(15, codyData[0].codyPhoto.length); //26
    fs.unlink(photo, function (err) {
        if (err){ 
            console.log('파일 삭제 실패 :',err);
        }else{
            console.log('codyPhoto 삭제완료');
        } 
    });
		await codyControl.deleteData(codyModel,codyId)
  	output.msg = 'cody delete success';
  	output.shopToken = shopInfo.userToken;
  	res.json(output);
};


//코디 보기(쇼핑몰이 올린)
exports.showWebCodyList = async function(req,res,next){
    let shopInfo = await jsonWebToken.TokenCheck(req.body.shopToken);
    var findData =  [
      { $match : { codyShopName :  shopInfo.ObjectId }},
      { $project : {
          codyTag : 1,
          codyPhoto : 1,
          codyCategoryCode : 1 ,
          codyClothNumber : 1,
          codyScheduleContent : 1,
          codyDegree : 1,
          codyWeather : 1,
          _id : 1,
          } 
      },
      { $sort: { _id: -1 }}
    ];
    let codyData = await codyControl.aggregate(codyModel,findData);
    if(codyData == 0 ){
        output.msg = 'cody data not exist';
        output.shopToken = shopInfo.userToken;
        res.json(output);
    }
    else{
        for(let key in codyData){
            let clothData = await dbModel.dbOverlap2(category.showClothPhoto,[codyData[key].codyClothNumber]);
            codyData[key].clothPhoto=[];
            codyData[key].clothName=[];   

            for(let i=0; i<codyData[key].codyClothNumber.length; i++){
                codyData[key].clothPhoto.push(clothData[i].clothPhoto);
                codyData[key].clothName.push(clothData[i].clothName);
            }
        }
        output.msg = 'cody show success';
        output.codyData = codyData;
        output.shopToken = shopInfo.userToken;
        res.json(output);
    } 
};


//코디 상세보기(웹페이지)
exports.showDetailWebCody = async function(req,res,next){
    let shopInfo = await jsonWebToken.TokenCheck(req.body.shopToken);
    let codyId = req.params.codyId;
		    codyId = ObjectId(codyId);
    let findData =  [
        { $match : { _id : codyId }},
        { $project : {
            codyTag : 1,
            codyPhoto : 1,
            codyCategoryCode : 1 ,
            codyClothNumber : 1,
            codyScheduleContent : 1,
            codyDegree : 1,
            codyWeather : 1,
            _id : 1,
            }
        },
        { $sort: { _id: -1 }}
    ];
    let codyData = await codyControl.aggregate(codyModel,findData);
    //옷데이터보기
    for(let key in codyData){
        let clothData = await dbModel.dbOverlap2(category.showClothPhoto,[codyData[key].codyClothNumber]);
        codyData[key].clothPhoto=[];
        codyData[key].clothName=[];   

        for(let i=0; i<codyData[key].codyClothNumber.length; i++){
            codyData[key].clothPhoto.push(clothData[i].clothPhoto);
            codyData[key].clothName.push(clothData[i].clothName);
        }
    }

  	output.msg = 'cody Detail CodyShow success';
  	output.data = codyData;
  	output.shopToken = shopInfo.userToken;
  	res.json(output);
};


//코디 보기 (앱)
exports.showCodyList = async function (req, res, next) {
    let userTokenInfo = await jsonWebToken.TokenCheck(req.body.userToken);
    let viewType = req.query.viewType; //보기 타입
    let sort; //보기 쿼리문 옵션

    if(viewType == 'lowPrice'){//낮은가격
        sort = { codyPrice: 1 }
    }else if(viewType == 'highPrice'){//높은가격
        sort = { codyPrice: -1 }
    }else if(viewType == 'favorite'){//인기
        sort = { codyUserClickAge: -1 }
    }else{ //최신순으로 
        sort = { _id: -1} //최신순 
    }
  
    let clothCode = req.query.clothCode ; //옷 코드 데이터
    let textSearch = req.query.textSearch; // 옷 검색 데이터
    let bigCode = [];
    let midCode = [];
    let smallCode = [];
    if(clothCode){
        for(let i = 0; i<clothCode.length; i++){
            str = String(clothCode[i]).substr(5,9);

            if(str == 0){
                str = String(clothCode[i]).substr(1,4)
                if(str == 0){
                    if(clothCode.length == 1){
                        bigCode.push(String(clothCode).substr(0,1))
                    }else{
                        bigCode.push(String(clothCode[i]).substr(0,1))
                    }
                }else{
                    if(clothCode.length == 1){
                        midCode.push(String(clothCode).substr(0,5))
                    }else{
                        midCode.push(String(clothCode[i]).substr(0,5))
                    }
                }
            }else{
                if(clothCode.length == 1){
                    smallCode.push(clothCode)
                }else{
                    smallCode.push(clothCode[i])
                }
            }
        }  
    } 
    
    let userIdCheckdata = { _id: userTokenInfo.ObjectId };
    let userInfo = await UserController.getUserFindObjectId(userIdCheckdata);
    let testBag = [];
    let testMybag = userInfo.userCodyMybag;
    for(let i=0 ; i<testMybag.length;i++){
        testBag.push(ObjectId(testMybag[i]));
    };
    codeRegex = [];
    tagRegex = [];
      
    for(let i = 0; i<bigCode.length; i++){
        codeRegex.push('^'+bigCode[i])
    }
    for(let i = 0; i<midCode.length; i++){
        codeRegex.push('^'+midCode[i])
    }
    let codeRe = new RegExp(codeRegex.join("|"));
    let tagRe;  
    if(textSearch){
        for(let i = 0; i<textSearch.length; i++){
            tagRegex.push(textSearch[i])
        }
        tagRe = new RegExp(tagRegex.join("|"));
    }

    let page = req.query.page || 1;
    let count=10;
    let pageCount = (page - 1) * count;
    let findData;
    if(textSearch){
        findData =  [
        { "$match": { 
          "$or": [
              { codyCategoryCode:{ $in : smallCode } },
              { codyCategoryCode: {  $in : [codeRe]  }},
           ]
        }},
        { $match : { codyTag:{ $in :[tagRe] }}},
            { $project : {
                codyTag : 1,
                codyPhoto : 1,
                codyCategoryCode : 1,
                _id : 1,
                userIsStar :  { $in: [ "$_id", { $literal: testBag } ] } 
                    }
            },
            { $sort: sort},
            {"$skip":pageCount},
            {"$limit":count}
        ];
    }else{
        findData =  [
          { "$match": { 
            "$or": [
                { codyCategoryCode:{ $in : smallCode } },
                { codyCategoryCode: {  $in : [codeRe]  }}, 
             ]
          }},
          { $project : {
              codyTag : 1,
              codyPhoto : 1,
              codyCategoryCode : 1,
              _id : 1,
              userIsStar :  { $in: [ "$_id", { $literal: testBag } ] } 
            }
          },
          { $sort: sort},
          {"$skip":pageCount},
          {"$limit":count}
        ];
    }

    let clothData = await codyControl.aggregateData(codyModel,findData);
    output.msg = 'show cody data ';
    output.data = clothData;
    output.userToken = userTokenInfo.userToken;
    res.json(output);
};


//845
    // findDate = { _id: ObjectId(codyId) };
    // updateData = { $push: { codyUserClickAge: age }};
    // codyControl.updateDate(codyModel,findDate,updateData);


//코디 상세보기(앱)
exports.showDetailCody = async function(req,res,next){
    let userTokenInfo = await jsonWebToken.TokenCheck(req.body.userToken);
    let userIdCheckdata = { _id: userTokenInfo.ObjectId };
    let userInfo = await UserController.getUserFindObjectId(userIdCheckdata);
    let testBag = [];
    let testMybag = userInfo.userCodyMybag;
    for(let i=0 ; i<testMybag.length;i++){
        testBag.push(ObjectId(testMybag[i]));
    };
    
    let codyId = req.params.codyId;
        codyId = ObjectId(codyId);
    let findData =  [
        { $match : { _id : codyId }},
        { $project : {
            codyTag : 1,
            codyPhoto : 1,
            codyCategoryCode : 1 ,
            codyClothNumber : 1,
            codyScheduleContent : 1,
            codyDegree : 1,
            codyWeather : 1,
            userIsStar :  { $in: [ "$_id", { $literal: testBag } ] }, 
            _id : 1
            }
        },
        { $sort: { _id: -1 }}
    ];
    let codyData = await codyControl.aggregate(codyModel,findData);

    //옷데이터보기
    for(let key in codyData){
        let clothData = await dbModel.dbOverlap2(category.showClothPhoto,[codyData[key].codyClothNumber]);
        codyData[key].clothPhoto=[];
        codyData[key].clothName=[];   

        for(let i=0; i<codyData[key].codyClothNumber.length; i++){
            codyData[key].clothPhoto.push(clothData[i].clothPhoto);
            codyData[key].clothName.push(clothData[i].clothName);
        }
    }
    let finalCloth = [];
    let clothBag = [];
    let clothMybag = userInfo.userClothMybag;
    if(!clothMybag.length == 0){
      for(var i=0 ; i<clothMybag.length;i++){
        clothBag.push(clothMybag[i]);
      };
    }
    
    //return console.log(codyData[0].codyClothNumber)
    for(var i = 0; i< codyData[0].codyClothNumber.length; i++){ //코디에 옷 개수만큼 
        var temp = new Object();
        temp.clothNumber= codyData[0].codyClothNumber[i];
        if(!clothBag.length == 0){
            for(var j = 0 ; j<clothMybag.length; j++){
                if(codyData[0].codyClothNumber[i] == clothMybag[j]){
                    temp.clothIsStar = true; 
                }else{
                   temp.clothIsStar = false;
                }
            }
      }
      temp.categoryCode= codyData[0].codyCategoryCode[i];
      temp.clothName= codyData[0].clothName[i];
      temp.clothPhoto= codyData[0].clothPhoto[i];
      finalCloth.push(temp);
    }

    output.msg = 'cody Detail CodyShow success';
    output.codyData = codyData;
    output.clothData = finalCloth;
    output.shopToken = userTokenInfo.userToken;
    res.json(output);
};


//코디 즐겨찾기 
exports.userCodyMybag = async function (req, res, next){
    let codyId = req.params.codyId;
    let userIsStar = req.body.userIsStar;
    let favoriteScore = 2;
    let userTokenInfo = await jsonWebToken.TokenCheck(req.body.userToken);
    let userIdCheckdata = { _id: userTokenInfo.ObjectId };
    let userInfo = await UserController.getUserFindObjectId(userIdCheckdata);
    //userFavoriteCodyCheck 유무판단  
    let findData =  { _id : ObjectId(userInfo._id),userFavoriteCodyCheck : codyId};
    let showData = {"$exists":true};
    let sortData = {_id: -1};
    let codyData = await codyControl.allShowData(User,findData,showData,sortData);

    if(codyData.length == 0){
        // myShowRoom-codyOverLap
        // 처음 선호도 검사한 코디 check에 push해준다.(User)
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
        var scoreData = [];
        for(var i = 0; i< categoryData.length; i++){                    
            scoreData.push(favoriteScore);
        } 
        //myShowRoom.favoriteInsert
        //category,score 데이터입력 (태그 입력은 따로해야됨)
        for(var key =0; key<categoryData.length;key++){
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
                             {tagName: tagData[count],tagScore:scoreData[key]}}};
                  await codyControl.updateDate(User,findData,updateData)
            //데이터 있을 시 점수만 올려줌
            }else{
                findData = { _id :  ObjectId(userInfo._id),"userCodyTag.tagName" :tagData[key]};
                updateData = {'$inc':{"userCodyTag.$.tagScore" : scoreData[key]}};
                await codyControl.updateDate(User,findData,updateData);
            }
        }
    }else{
        findData =  { _id : ObjectId(codyId)};
        showData = {_id : 0 ,codyCategoryCode : 1, codyTag : 1 };
        sortData = {_id: -1};

        let codyCategory_tag = await codyControl.allShowData(codyModel,findData,showData,sortData);
        let categoryData = codyCategory_tag[0].codyCategoryCode;
        let tagData = codyCategory_tag[0].codyTag;
        let scoreData = [];

        for(var i = 0; i< categoryData.length; i++){                    
            scoreData.push(favoriteScore);
        } 

        //점수 업데이트 
        for(var key =0 ; key < categoryData.length; key++){
            findData = {_id: ObjectId(userInfo._id), userFavorite : 
                { $elemMatch: { favoriteCategoryCode : categoryData[key]}}};
            showData = {"$exists":true};
            sortData = {_id: -1};
            //카테고리데이터의 유무만 판단.
            let categoryExist = await codyControl.allShowData(User,findData,showData,sortData);
            //데이터 0개면 등록
            if(categoryExist.length == 0){
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
        var tagScoreData = [];
        for(var i = 0; i< tagData.length; i++){                   
            tagScoreData.push(1);
        } 
        
        for(var key =0 ; key < tagData.length; key++){  
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

        if(userIsStar == "true"){ //즐겨찾기 해제
            findDate = { _id : ObjectId(codyId) };
            updateData = { $pull: { codyStarUsers: userInfo.userId }};
            await codyControl.updateDate(codyModel,findDate,updateData);
            findDate = { _id : ObjectId(userInfo._id) };
            updateData = { $pull: { userCodyMybag: codyId }};
            await codyControl.updateDate(User,findDate,updateData);
        }else{ //즐겨찾기 추가
            findDate = { _id : ObjectId(codyId) };
            updateData = { $push: { codyStarUsers: userInfo.userId }};
            await codyControl.updateDate(codyModel,findDate,updateData)
            findDate = { _id : ObjectId(userInfo._id) };
            updateData = { $push: { userCodyMybag: codyId }};
            await codyControl.updateDate(User,findDate,updateData);
        }
        output.msg = 'success';
        output.userToken = userTokenInfo.userToken;
        res.json(output);
  };  
}