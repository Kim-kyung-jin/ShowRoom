const config=require('config');
const cloth = require('../utils/clothController'); 
const category = require('../utils/categoryController'); 
const User=require('../model/Userdb.js');
const codyModel = require('../model/CodyModel.js');
const codyControl = require('../utils/codyController');
const myShowRoom = require('../utils/myShowRoomController');
const dbModel = require('../utils/dbOverlap');  
const ObjectId = require('mongodb').ObjectID;	
const UserController=require('../utils/userController');
const jsonWebToken=require('../utils/jsonWebToken');
const output = new Object();
const multer = require('../utils/multers3');

//옷 등록 -아마존 완성
exports.addCloth = async function (req, res, next){
	try{
    	if(req.headers.shoptoken == "guest"){
            output.msg = "success";
            res.setHeader('shopToken',"guest");
            res.json(output);
        }else if(req.headers.shoptoken == null){
            output.msg = "success";
            output.data = null;
            res.json(output);
        }else if(req.headers.shoptoken == undefined) {
            output.msg = "success";
            output.data = null;
            res.json(output);
        }else{
			let shopToken = await jsonWebToken.TokenCheck(req.headers.shoptoken); 
			let PhotoFile=req.file;
			let clothPhoto,clothPhotoKey
			
			if(PhotoFile){
				clothPhoto= PhotoFile.transforms[0].location
				clothPhotoKey= PhotoFile.transforms[0].key
			}else{
				console.log('clothPhoto must Insert!!!!!!!!!!!!');
			    return res.status(400).send('clothPhoto must Insert!!!!!!!!!!!!');
			}

			if(req.body.cloth1Size =='true'){ var cloth1Size = Boolean(1)}else{ var cloth1Size = Boolean(0)};  
			if(req.body.cloth2Size =='true'){ var cloth2Size = Boolean(1)}else{ var cloth2Size = Boolean(0)};
			if(req.body.cloth3Size =='true'){ var cloth3Size = Boolean(1)}else{ var cloth3Size = Boolean(0)};
			if(req.body.cloth4Size =='true'){ var cloth4Size = Boolean(1)}else{ var cloth4Size = Boolean(0)};
			if(req.body.cloth5Size =='true'){ var cloth5Size = Boolean(1)}else{ var cloth5Size = Boolean(0)};
			if(req.body.cloth6Size =='true'){ var cloth6Size = Boolean(1)}else{ var cloth6Size = Boolean(0)};
			if(req.body.cloth7Size =='true'){ var cloth7Size = Boolean(1)}else{ var cloth7Size = Boolean(0)};
			if(req.body.cloth8Size =='true'){ var cloth8Size = Boolean(1)}else{ var cloth8Size = Boolean(0)};
			if(req.body.cloth9Size =='true'){ var cloth9Size = Boolean(1)}else{ var cloth9Size = Boolean(0)};
			if(req.body.cloth10Size =='true'){ var cloth10Size = Boolean(1)}else{ var cloth10Size = Boolean(0)};
			if(req.body.cloth11Size =='true'){ var cloth11Size = Boolean(1)}else{ var cloth11Size = Boolean(0)};
			if(req.body.clothFreeSize =='true'){ var clothFreeSize = Boolean(1)}else{ var clothFreeSize = Boolean(0)};
			
			let clothInfo = {
				clothName : req.body.clothName,
				clothPhoto : clothPhoto,
				clothPrice : req.body.clothPrice,
				cloth1Size : cloth1Size,
				cloth2Size : cloth2Size,
				cloth3Size : cloth3Size,
				cloth4Size : cloth4Size,
				cloth5Size : cloth5Size,
				cloth6Size : cloth6Size,
				cloth7Size : cloth7Size,
				cloth8Size : cloth8Size,
				cloth9Size : cloth9Size,
				cloth10Size :cloth10Size,
				cloth11Size : cloth11Size,
				clothFreeSize : clothFreeSize,
				clothType : req.body.clothType,
				clothUrl : req.body.clothUrl,
				clothPhotoKey : clothPhotoKey
			};
			
			let categoryInfo = {
				categoryCode : req.body.categoryCode
			};  

			let codyInsert_findData = await dbModel.dbOverlap3(cloth.addCloth.clothInsert,cloth.addCloth.newClothNumber,clothInfo);
			let clothNumber  = codyInsert_findData[0].clothNumber;

			let cloth_catagory = {
				clothNumber : clothNumber,	
				categoryCode : categoryInfo.categoryCode
			}

			let cloth_shopName = {
				clothNumber : clothNumber,
				shopName : shopToken.ObjectId
			}
			let test1 = await dbModel.dbOverlap2(cloth.addCloth.cloth_Category,cloth_catagory);
			await dbModel.dbOverlap2(cloth.addCloth.cloth_shop,cloth_shopName);
		 	output.msg ='cloth add success';
		  	res.setHeader('shopToken', shopToken.userToken);
		  	res.json(output);
		  }
    }catch(e){
        if(req.file) {
            let deletePhoto = await multer.deleteFile([
                { Key: req.file.transforms[1].key }
            ]);
        }
        output.msg = 'fail';
        output.data = e.message;
        res.setHeader('shopToken',req.headers.shoptoken);
        res.json(output);
    }
}


//옷수정
exports.editCloth = async function (req, res, next){
	try{
        if(req.headers.shoptoken == "guest"){
            output.msg = "success";
            res.setHeader('shopToken',"guest");
            res.json(output);
        }else if(req.headers.shoptoken == null){
            output.msg = "success";
            output.data = null;
            res.json(output);
        }else if(req.headers.shoptoken == undefined) {
            output.msg = "success";
            output.data = null;
            res.json(output);
        }else{
			let shopInfo = await jsonWebToken.TokenCheck(req.headers.shoptoken); 
			let clothNumber = req.params.clothNumber;
			let clothInfo1 = {};
			let PhotoFile=req.file;

		    if(PhotoFile){
		        clothInfo1.clothPhoto = PhotoFile.transforms[0].location;
		        clothInfo1.clothPhotoKey = PhotoFile.transforms[0].key;
		    }

			if(req.body.cloth1Size =='true'){ var cloth1Size = Boolean(1)}else{ var cloth1Size = Boolean(0)};
			if(req.body.cloth2Size =='true'){ var cloth2Size = Boolean(1)}else{ var cloth2Size = Boolean(0)};
			if(req.body.cloth3Size =='true'){ var cloth3Size = Boolean(1)}else{ var cloth3Size = Boolean(0)};
			if(req.body.cloth4Size =='true'){ var cloth4Size = Boolean(1)}else{ var cloth4Size = Boolean(0)};
			if(req.body.cloth5Size =='true'){ var cloth5Size = Boolean(1)}else{ var cloth5Size = Boolean(0)};
			if(req.body.cloth6Size =='true'){ var cloth6Size = Boolean(1)}else{ var cloth6Size = Boolean(0)};
			if(req.body.cloth7Size =='true'){ var cloth7Size = Boolean(1)}else{ var cloth7Size = Boolean(0)};
			if(req.body.cloth8Size =='true'){ var cloth8Size = Boolean(1)}else{ var cloth8Size = Boolean(0)};
			if(req.body.cloth9Size =='true'){ var cloth9Size = Boolean(1)}else{ var cloth9Size = Boolean(0)};
			if(req.body.cloth10Size =='true'){ var cloth10Size = Boolean(1)}else{ var cloth10Size = Boolean(0)};
			if(req.body.cloth11Size =='true'){ var cloth11Size = Boolean(1)}else{ var cloth11Size = Boolean(0)};
			if(req.body.clothFreeSize =='true'){ var clothFreeSize = Boolean(1)}else{ var clothFreeSize = Boolean(0)};

			clothInfo1.clothName = req.body.clothName
			clothInfo1.clothPrice = req.body.clothPrice
			clothInfo1.cloth1Size = cloth1Size
			clothInfo1.cloth2Size = cloth2Size
			clothInfo1.cloth3Size = cloth3Size
			clothInfo1.cloth4Size = cloth4Size
			clothInfo1.cloth5Size = cloth5Size
			clothInfo1.cloth6Size = cloth6Size
			clothInfo1.cloth7Size = cloth7Size
			clothInfo1.cloth8Size = cloth8Size
			clothInfo1.cloth9Size = cloth9Size
			clothInfo1.cloth10Size = cloth10Size
			clothInfo1.cloth11Size = cloth11Size
			clothInfo1.clothFreeSize = clothFreeSize
			clothInfo1.clothType = req.body.clothType
			clothInfo1.clothUrl = req.body.clothUrl
			
			let clothInfo2 = {
				categoryCode : req.body.categoryCode
			};   

			let clothData;
			let deleteData = [];

			if(PhotoFile){
				clothData = await dbModel.dbOverlap2(cloth.editCloth.clothData,clothNumber);
				if(clothData.length == 0){
					return res.status(400).send('clothPhoto not exist!!!!!!!!!!!!');
				}else{
		            deleteData.push({Key: clothData[0].clothPhotoKey})
		            await multer.deleteFile(deleteData);
				}
			}

			let data = [clothInfo1,clothNumber];
			let clothEdit = await dbModel.dbOverlap2(cloth.editCloth.updateCloth,data);
			let shopData = { shopName : shopInfo.ObjectId };
			let updateCloth_category = await dbModel.dbOverlap2(cloth.editCloth.updateCloth_category,[clothInfo2,clothNumber]);
			let updateCloth_shop = await dbModel.dbOverlap2(cloth.editCloth.updateCloth_shop,[shopData,clothNumber]);
		  	output.msg = 'cloth edit success';
		  	res.setHeader('shopToken', shopInfo.userToken);
		  	res.json(output);
	  	}
 	}catch(e){
        if(req.file) {
            let deletePhoto = await multer.deleteFile([
                { Key: req.file.transforms[1].key }
            ]);
        }
        output.msg = 'fail';
        output.data = e.message;
        res.setHeader('shopToken',req.headers.shoptoken);
        res.json(output);
    }
};


//옷 삭제
exports.deleteCloth = async function (req, res, next) {
	try{
        if(req.headers.shoptoken == "guest"){
            output.msg = "success";
            res.setHeader('shopToken',"guest");
            res.json(output);
        }else if(req.headers.shoptoken == null){
            output.msg = "success";
            output.data = null;
            res.json(output);
        }else if(req.headers.shoptoken == undefined) {
            output.msg = "success";
            output.data = null;
            res.json(output);
        }else{
			let shopInfo = await jsonWebToken.TokenCheck(req.headers.shoptoken); 
			let clothNumber = req.params.clothNumber;
			let clothData = await dbModel.dbOverlap2(cloth.editCloth.clothData,clothNumber);

			if(clothData.length == 0){
				return res.status(400).send('clothPhoto not exist!!!!!!!!!!!!');
			}else{
				let deleteData = [];
		        deleteData.push({Key: clothData[0].clothPhotoKey})
		        await multer.deleteFile(deleteData);
			}

			let clothCategory = await dbModel.dbOverlap2(cloth.deleteCloth.cloth_category,clothNumber);

			if(clothCategory ==0){
		    	output.msg = 'cloth delete success';
		    	output.shopToken = shopInfo.userToken;
			}else{
				let categoryCode = clothCategory[0].categoryCode;
				let clothPrice = clothCategory[0].clothPrice;
				let [delete1,delete2,delete3] = 
			    await Promise.all([
			    	dbModel.dbOverlap2(cloth.deleteCloth.deleteCloth,clothNumber),
			    	dbModel.dbOverlap2(cloth.deleteCloth.deleteCloth_category,clothNumber),
			    	dbModel.dbOverlap2(cloth.deleteCloth.deleteCloth_shop,clothNumber)
				]); 
				          	
				let findDate = { codyClothNumber : { $all: clothNumber }};
				let updateData = { 
					$pull: { codyClothNumber : clothNumber , codyCategoryCode : categoryCode,codyClothPrice : clothPrice },
					$inc:{ codyPrice : -clothPrice }
				};
				let Update_cody_cloth = await codyControl.updateDate(codyModel,findDate,updateData);
				output.msg = 'cloth delete success';
			}

			res.setHeader('shopToken', shopInfo.userToken);
			res.json(output);
		}
    }catch(e){
        output.msg = 'fail';
        output.data = e.message;
        res.setHeader('shopToken',req.headers.shoptoken);
        res.json(output);
    }
}


//옷 상세보기전 데이터 (웹) -아마존 완성
exports.showDetailBeforeCloth = async function (req, res, next){
	try{
        if(req.headers.shoptoken == "guest"){
            output.msg = "success";
            res.setHeader('shopToken',"guest");
            res.json(output);
        }else if(req.headers.shoptoken == null){
            output.msg = "success";
            output.data = null;
            res.json(output);
        }else if(req.headers.shoptoken == undefined) {
            output.msg = "success";
            output.data = null;
            res.json(output);
        }else{
			let shopInfo = await jsonWebToken.TokenCheck(req.headers.shoptoken); //토큰확인 
			let clohData = await dbModel.dbOverlap2(cloth.showDeTailBeforeCloth,shopInfo.ObjectId);

			if(clohData == 0){
		    	output.msg = 'cloth data not exist';
		    	output.data = null;
			}else{
				let clothAllData=changeData2(clohData);
				output.msg = 'cloth show success';
				output.data = clothAllData;
			}     
			res.setHeader('shopToken', shopInfo.userToken);
			res.json(output);
		}
    }catch(e){
        output.msg = 'fail';
        output.data = e.message;
        res.setHeader('shopToken',req.headers.shoptoken);
        res.json(output);
    }
}


//옷 상세보기 (웹) -아마존 완성
exports.detailCloth = async  function (req, res, next){
	try{
        if(req.headers.shoptoken == "guest"){
            output.msg = "success";
            res.setHeader('shopToken',"guest");
            res.json(output);
        }else if(req.headers.shoptoken == null){
            output.msg = "success";
            output.data = null;
            res.json(output);
        }else if(req.headers.shoptoken == undefined) {
            output.msg = "success";
            output.data = null;
            res.json(output);
        }else{
			let shopInfo = await jsonWebToken.TokenCheck(req.headers.shoptoken); //토큰확인  
			let clothNumber = req.params.clothNumber;
			let clothData = await dbModel.dbOverlap2(cloth.showDeTailCloth,clothNumber);

			if(clothData ==0){
		    	output.msg = 'cloth data not exist';
		    	output.data = null;
			}else{
				var clothAllData=changeData(clothData);
		      	output.msg = 'cloth shop success';
		      	output.data = clothAllData;
			}  
			
			res.setHeader('shopToken', shopInfo.userToken);  
			res.json(output);  
		}
    }catch(e){
        output.msg = 'fail';
        output.data = e.message;
        res.setHeader('shopToken',req.headers.shoptoken);
        res.json(output);
    }
}


//타입별 옷보기 웹 -아마존 완성
exports.showClothTypeList = async function (req, res, next) {
	try{
        if(req.headers.shoptoken == "guest"){
            output.msg = "success";
            res.setHeader('shopToken',"guest");
            res.json(output);
        }else if(req.headers.shoptoken == null){
            output.msg = "success";
            output.data = null;
            res.json(output);
        }else if(req.headers.shoptoken == undefined) {
            output.msg = "success";
            output.data = null;
            res.json(output);
        }else{
			let shopInfo = await jsonWebToken.TokenCheck(req.headers.shoptoken); //토큰확인 
			let Type = req.params.type;
			let clothType;
			
			if(Type == 'outer'){
				clothType = 1;
			}else if(Type == 'top'){
				clothType = 2;
			}else if(Type == 'bottom'){
				clothType = 3;
			}else if(Type == 'suit'){
				clothType = 4;
			}else if(Type == 'summer'){
				clothType = 5;
			}else if(Type == 'bag'){
				clothType = 6;
			}else if(Type == 'shoes'){
				clothType = 7;
			}else if(Type == 'acc'){
				clothType = 8;
			}else{
				console.log('Incorrect data');
			    return res.status(400).send('Incorrect clothType!!!!!!!!!!!!');
			}
			
			let clothData = await dbModel.dbOverlap2(cloth.showClothTypeList,[shopInfo.ObjectId,clothType]);

			if(clothData == 0){
		    	output.msg = 'cloth data not exist';
		    	output.data = null;
			}else{
				var clothAllData = changeData(clothData);
			  	output.msg = 'cloth show success';
			  	output.data = clothAllData;
			}
			res.setHeader('shopToken', shopInfo.userToken);
			res.json(output);
		}
    }catch(e){
        output.msg = 'fail';
        output.data = e.message;
        res.setHeader('shopToken',req.headers.shoptoken);
        res.json(output);
    }
};


//옷 모든보기 (웹) 
exports.showWebClothList = async function (req, res, next) {
	try{
        if(req.headers.shoptoken == "guest"){
            output.msg = "success";
            res.setHeader('shopToken',"guest");
            res.json(output);
        }else if(req.headers.shoptoken == null){
            output.msg = "success";
            output.data = null;
            res.json(output);
        }else if(req.headers.shoptoken == undefined) {
            output.msg = "success";
            output.data = null;
            res.json(output);
        }else{
			let shopInfo = await jsonWebToken.TokenCheck(req.headers.shoptoken); //토큰확인 
			let clohData = await dbModel.dbOverlap2(cloth.showClothList,shopInfo.ObjectId);

			if(clohData == 0){
		    	output.msg = 'cloth data not exist';
		    	output.data = null;
			}else{
				let clothAllData=changeData(clohData);
		 	  	output.msg ='all cloth shop success';
			  	output.data = clothAllData;
			}
			res.setHeader('shopToken', shopInfo.userToken);
			res.json(output);
		}
    }catch(e){
        output.msg = 'fail';
        output.data = e.message;
        res.setHeader('shopToken',req.headers.shoptoken);
        res.json(output);
    }
};


//옷 보기 (필터 통합)(앱) 
exports.showClothList = async function (req, res, next) {
	try{
        if(req.headers.usertoken == null){
            output.msg = "success";
            output.data = null;
            res.json(output);
        }else if(req.headers.usertoken == undefined){
            output.msg = "success";
            output.data = null;
            res.json(output);
        }else{
			let pageCount = req.query.page || 0;
			let page = 10*pageCount
			let viewType = req.query.viewType; //보기 타입
			let sql = cloth.showAppClothList.basic //기본 쿼리문
			let viewQuery; //보기 쿼리문 옵션
			let clothCode = req.query.clothCode ; //옷 코드 데이터
			let textSearch = req.query.textSearch; // 옷 검색 데이터
			
			if(viewType == 'lowPrice'){//낮은가격
				viewQuery = ' order by clothPrice asc'
			}else if(viewType == 'highPrice'){//높은가격
				viewQuery = ' order by clothPrice desc'
			}else if(viewType == 'favorite'){//인기
				viewQuery = ' order by clothClickCount desc'
			}else{ //최신순으로 
				viewQuery = ' order by clothNumber desc'	
			}
			let bigCode = []
			let midCode = []
			let smallCode = []
			let bQuery =''
			let mQuery =''
			let sQuery =''
			
			if(clothCode){
				for(let i = 0; i<clothCode.length; i++){
					str = String(clothCode[i]).substr(5,9)
					
					if(str == 0){
						str = String(clothCode[i]).substr(1,4)
						if(str == 0){
							if(clothCode.length == 1){
								bigCode.push(Number(clothCode))
							}else{
								bigCode.push(Number(clothCode[i]))
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

				if(!(smallCode.length == 0)){ 
					sQuery = ' cloth_category.categoryCode in (?)'
					if(!(midCode.length == 0)){
						for(var i =0; i<midCode.length;i++){
							if(i==0){
								mQuery = ' or cloth_category.categoryCode between '+String(Number(midCode[i])*10000)+' and '+String((Number(midCode[i])+1)*10000-1)
							}else{
								mQuery = mQuery+' or cloth_category.categoryCode between '+String(Number(midCode[i])*10000)+' and '+String((Number(midCode[i])+1)*10000-1)
							}
						}
						if(!(bigCode.length == 0)){
							for(var i =0; i<bigCode.length;i++){
								if(i==0){
									bQuery = ' or cloth_category.categoryCode between '+String(bigCode[i])+' and '+String((bigCode[i])+100000000-1)
									
								}else{
									bQuery = bQuery+' or cloth_category.categoryCode between '+String(bigCode[i])+' and '+String((bigCode[i])+100000000-1)
									
								}
							}
						}
					}else{
						if(!(bigCode.length == 0)){
							for(var i =0; i<bigCode.length;i++){
								if(i==0){
									bQuery = ' or cloth_category.categoryCode between '+String(bigCode[i])+' and '+String((bigCode[i])+100000000-1)
								}else{
									bQuery = bQuery+' or cloth_category.categoryCode between '+String(bigCode[i])+' and '+String((bigCode[i])+100000000-1)
								}
							}
						}
					}
				}else{ // smallCode가 0개일때 
					if(!(midCode.length == 0)){
						for(var i =0; i<midCode.length;i++){
							if(i ==0){
								mQuery = ' cloth_category.categoryCode between '+String(Number(midCode[i])*10000)+' and '+String((Number(midCode[i])+1)*10000-1)
							}else{
								mQuery = mQuery+' or cloth_category.categoryCode between '+String(Number(midCode[i])*10000)+' and '+String((Number(midCode[i])+1)*10000-1)
							}
						}
						if(!(bigCode.length == 0)){
							for(var i =0; i<bigCode.length;i++){
								if(i==0){
									bQuery = ' or cloth_category.categoryCode between '+String(bigCode[i])+' and '+String((bigCode[i])+100000000-1)
								}else{
									bQuery = bQuery+' or cloth_category.categoryCode between '+String(bigCode[i])+' and '+String((bigCode[i])+100000000-1)
								}
							}
						}
					}else{
						if(!(bigCode.length == 0)){
							for(var i =0; i<bigCode.length;i++){
								if(i==0){
									bQuery = ' cloth_category.categoryCode between '+String(bigCode[i])+' and '+String((bigCode[i])+100000000-1)
								}else{
									bQuery = bQuery+' or cloth_category.categoryCode between '+String(bigCode[i])+' and '+String((bigCode[i])+100000000-1)
								}
							}
						}
					}
				}

				if(textSearch){
					for(var i =0; i<textSearch.length;i++){
						if(i == 0){
							textQuery = ' cloth.clothName like\'%'+textSearch[i]+'%\''
						}else{
							textQuery = textQuery+' or cloth.clothName like\'%'+textSearch[i]+'%\''
						}
					}
				}
			}else{
				if(textSearch){
					for(var i =0; i<textSearch.length;i++){
						if(i == 0){
							textQuery = ' where cloth.clothName like\'%'+textSearch[i]+'%\''
						}else{
							textQuery = textQuery+' or cloth.clothName like\'%'+textSearch[i]+'%\''
						}
					}
				}
			}

			// 최종쿼리문 생성
			if(!clothCode & !textSearch){
				sql = sql + viewQuery + ' limit 5 offset ?'
			}else if(!clothCode || textSearch){
				sql = sql + textQuery + viewQuery + ' limit 5 offset ?'
			}else if(!textSearch || clothCode){
				sql = sql +' where ( '+ sQuery + mQuery + bQuery +' ) ' + viewQuery + ' limit 10 offset ?'
			}else{
				sql = sql+' where ( '+ sQuery+mQuery + bQuery +' ) '+' and ( '+ textQuery + ' ) '+viewQuery + ' limit 5 offset ?'
			}

			if(smallCode == 0){
				data = page;
			}else{
				data = [[smallCode],page]
			}

			let clohData = await dbModel.dbOverlap2(sql,data);
			let userInfo ;
			let userTokenInfo ;
			if(!(req.headers.usertoken == 'guest')){
				userTokenInfo = await jsonWebToken.TokenCheck(req.headers.usertoken);
				let userIdCheckdata = { _id: userTokenInfo.ObjectId };
				userInfo = await UserController.getUserFindObjectId(userIdCheckdata);
			}

			let finalCloth = [];
			if(clohData == 0){
		    	output.msg = 'cloth data not exist';    
		    	output.data = null;    	
		    	res.json(output);
			}else{
				let clothBag = [];
				if(req.headers.usertoken == 'guest'){
					for(var i = 0; i< clohData.length; i++){ // 옷 개수만큼 
						var temp = new Object();
						temp.clothNumber= clohData[i].clothNumber;
						temp.clothIsStar = false;
						temp.clothName= clohData[i].clothName;
						temp.clothPhoto= clohData[i].clothPhoto;
						temp.clothPrice= clohData[i].clothPrice;
						temp.clothUrl= clohData[i].clothUrl;
						// temp.shopName= clohData[i].shopName;
						// temp.shopPhoto= clohData[i].shopPhoto;
						finalCloth.push(temp);
					}
		            output.msg = "success";
		            output.data = finalCloth;
		            res.setHeader('userToken',"guest");
			    	res.json(output);
				}else{
					let clothMybag = userInfo.userClothMybag;
					
					if(!clothMybag.length == 0){
						for(var i=0 ; i<clothMybag.length;i++){
							clothBag.push(clothMybag[i]);
						};
					}					
					for(var i = 0; i< clohData.length; i++){ // 옷 개수만큼 
						var temp = new Object();
						temp.clothNumber= clohData[i].clothNumber;
						if(!clothBag.length == 0){
							for(var j = 0 ; j<clothBag.length; j++){
			    				if(clohData[i].clothNumber  == clothBag[j] ){
			    					temp.clothIsStar = true; 
								}else{
									if( temp.clothIsStar == undefined )
										temp.clothIsStar = false; 
								}
							}
						}else{
							temp.clothIsStar = false;
						}
						temp.clothName= clohData[i].clothName;
						temp.clothPhoto= clohData[i].clothPhoto;
						temp.clothPrice= clohData[i].clothPrice;
						temp.clothUrl= clohData[i].clothUrl;
						// temp.shopName= clohData[i].shopName;
						// temp.shopPhoto= clohData[i].shopPhoto;
						finalCloth.push(temp);
					}
				   	output.msg = 'success';
			    	output.data = finalCloth;
			    	res.setHeader('userToken', userTokenInfo.userToken);
			    	res.json(output);
			    }
			}
		}
    }catch(e){
        output.msg = 'fail';
        output.data = e.message;
        res.setHeader('userToken',req.headers.usertoken);
        res.json(output);
    }
};


//옷 상세보기 앱
exports.showDetailCloth = async function (req, res, next){
	try{
        if(req.headers.usertoken == "guest"){
            output.msg = "success";
            res.setHeader('shopToken',"guest");
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
			let clothNumber = req.params.clothNumber; 
			let favoriteScore = 1;
			let userTokenInfo = await jsonWebToken.TokenCheck(req.headers.usertoken);
			let userIdCheckdata = { _id: userTokenInfo.ObjectId };
			let userInfo = await UserController.getUserFindObjectId(userIdCheckdata); 
			let clothCategory = await dbModel.dbOverlap2(category.showClothCode,clothNumber); //카테고리 정보 
			let categoryCodeData = clothCategory
			//	favoriteInsert 부분 
			for(var count = 0; count<categoryCodeData.length; count++){
		   		let findData = {_id: ObjectId(userInfo._id), userFavorite : 
				   			   { $elemMatch: { favoriteCategoryCode : categoryCodeData[0].categoryCode}}};
		   		let showData = {"$exists":true};
		   		let sortData = {_id: -1};
		   		//데이터의 유무만 판단.
		   		let dataExist = await codyControl.allShowData(User,findData,showData,sortData)
				// 데이터 0개면 등록
				if(dataExist.length == 0){
					findData = { _id :  ObjectId(userInfo._id)};
					let updateData = {$push:{userFavorite:
								     {favoriteCategoryCode: categoryCodeData[0].categoryCode,favoriteScore:favoriteScore}}};
					let clothCategory = await codyControl.updateDate(User,findData,updateData);
				//데이터 있을 시 점수만 올려줌
				}else{
					findData = { _id :  ObjectId(userInfo._id),"userFavorite.favoriteCategoryCode" :categoryCodeData[0].categoryCode};
					let updateData = {'$inc':{"userFavorite.$.favoriteScore" : favoriteScore}};
					let clothCategory = await codyControl.updateDate(User,findData,updateData);
				}
			}

			let updateCloth_category = await dbModel.dbOverlap2(cloth.editCloth.updateClothClick,[clothNumber]);
			output.msg = 'success';
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


//옷  즐겨찾기 
exports.userClothMybag = async function (req, res, next){
	try{
        if(req.headers.usertoken == "guest"){
            output.msg = "success";
            res.setHeader('shopToken',"guest");
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
			let clothNumber = 
			req.params.clothNumber;
			let favoriteScore = [];
			favoriteScore.push(2);
			let userIsStar = req.body.userIsStar; //즐겨찾기 옵션
		    let userTokenInfo = await jsonWebToken.TokenCheck(req.headers.usertoken);
			let userIdCheckdata = { _id: userTokenInfo.ObjectId };
			let userInfo = await UserController.getUserFindObjectId(userIdCheckdata);
			let categoryData = await dbModel.dbOverlap2(cloth.clothCategoryCode,clothNumber); //카테고리데이터
			let categoryCode = [];
			categoryCode.push(categoryData[0].categoryCode);
			
			let clothFavoriteInsert = await myShowRoom.clothInsert(userInfo._id,categoryCode,favoriteScore)
			if(userIsStar == false){ //즐겨찾기 해제
				let findDate = { _id : ObjectId(userTokenInfo.ObjectId)};
				let updateData = { $pull: { userClothMybag : clothNumber }};
				let update = await codyControl.updateDate(User,findDate,updateData); 
				
			}else{ //즐겨찾기 추가
				var findDate = { _id : ObjectId(userTokenInfo.ObjectId)};
				var updateData = { $push: { userClothMybag : clothNumber }};
				let update = await codyControl.updateDate(User,findDate,updateData);
			}

			output.msg ='success';
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

function changeData(result){
	var clothAllData={};
	var test =[];
	for(var i=0; i<result.length; i++){
		clothAllData.clothNumber=result[i].clothNumber,
		clothAllData.clothName=result[i].clothName,
		clothAllData.clothPhoto = result[i].clothPhoto,
		clothAllData.clothPrice = result[i].clothPrice,
		clothAllData.clothType = result[i].clothType, 
		clothAllData.size=[
			cloth1Size=result[i].cloth1Size,
			cloth2Size=result[i].cloth2Size,
			cloth3Size=result[i].cloth3Size,
			cloth4Size=result[i].cloth4Size,
			cloth5Size=result[i].cloth5Size,
			cloth6Size=result[i].cloth6Size,
			cloth7Size=result[i].cloth7Size,
			cloth8Size=result[i].cloth8Size,
			cloth9Size=result[i].cloth9Size,
			cloth10Size=result[i].cloth10Size,
			cloth11Size=result[i].cloth11Size,
			clothFreeSize=result[i].clothFreeSize
		],
		clothAllData.clothUrl = result[i].clothUrl,
		clothAllData.shopName = result[i].shopName,
		clothAllData.categoryCode = result[i].categoryCode,
		clothAllData.categoryColor = result[i].categoryColor,
		clothAllData.categoryDescription = result[i].categoryDescription
		test.push(clothAllData);
		clothAllData={};
	}
	return test;
}

function changeData2(result){
	var clothAllData={};
	var test =[];
	for(var i=0; i<result.length; i++){
		clothAllData.clothNumber=result[i].clothnumber,
		clothAllData.clothType=result[i].clothtype,
		clothAllData.clothName=result[i].clothname,
		clothAllData.clothPhoto = result[i].clothphoto,
		clothAllData.clothPrice = result[i].clothprice,
		clothAllData.categoryCode = result[i].categorycode,
		clothAllData.categoryDescription = result[i].categorydescription
		test.push(clothAllData);
		clothAllData={};
	}
	return test;
}