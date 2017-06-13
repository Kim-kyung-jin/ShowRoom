const config=require('config');
const bcrypt=require('../utils/bcrypt');
const shop = require('../utils/shopController');   
const dbModel = require('../utils/dbOverlap');  
const output = new Object();
const jsonWebToken=require('../utils/jsonWebToken');
const nodemailer=require('../utils/nodemailer');
const multer = require('../utils/multers3');

//쇼핑몰 보기
exports.showShopList = async function (req, res, next) {
    let showShop = await dbModel.dbOverlap(shop.showShopList);
    output.msg = "success";
    output.data = showShop;
    res.json(output);
};

//쇼핑몰 등록
exports.addShop = async function(req, res, next){
	try{
	    let shopIdCheck = await dbModel.dbOverlap2(shop.findShopName,req.body.shopName); //아이디 중복체크 
	    if(shopIdCheck.length >0){ 
	        return res.status(400).send('아이디 중복'); 
	    }
	    
	    let shopPwd = req.body.shopPwd;
	    let PhotoFile=req.file; 
	    let shopPhoto,shopPhotoKey;
	    
	    if(PhotoFile){
	        shopPhoto= PhotoFile.transforms[0].location
	        shopPhotoKey= PhotoFile.transforms[0].key
	    }else{
	        shopPhoto = 'https://s3.ap-northeast-2.amazonaws.com/showroompark/shop/default/default_Img';
	        shopPhotoKey= req.body.shopName;
	    } 
	    let shopInfo = {
	        shopName : req.body.shopName,
	        shopPwd : bcrypt.hashPw(shopPwd),
	        shopEmail : req.body.shopEmail,
	        shopUrl : req.body.shopUrl,
	        shopAddress : req.body.shopAddress,
	        shopPhoto : shopPhoto,
	        shopPhone : req.body.shopPhone,
	        shopPhotoKey : shopPhotoKey
	    }; 
	    
	    let [shopInsert] = 
	    await Promise.all([dbModel.dbOverlap2(shop.addShop.shopInsert,shopInfo)]); //await 여러개 동시에 //데이터입력 
	    output.msg = "회원가입 성공" ;
	    res.json(output);
	}catch(e){
		output.msg = 'fail';
		output.data = e.message;
		res.json(output);
	}
};



//쇼핑몰 수정
exports.editShop = async function (req, res, next){
	try{
		if(req.headers.shoptoken == "guest"){
			output.msg = "success";
			res.setHeader('shopToken',"guest");
			res.json(output);
		}else if(req.headers.shoptoken == null || req.headers.shoptoken == undefined ){
			output.msg = "success";
			output.data = null;
			res.json(output);
		}else{
		    let shopToken = await jsonWebToken.TokenCheck(req.headers.shoptoken); //토큰확인 
		    let PhotoFile=req.file;
		    let newPwd = req.body.newShopPwd    
		    let shopInfo = {
		        shopEmail : req.body.shopEmail,
		        shopUrl : req.body.shopUrl,
		        shopAddress : req.body.shopAddress,
		        shopPhone : req.body.shopPhone,
		    };

		    if(PhotoFile){
		        shopInfo.shopPhoto = PhotoFile.transforms[0].location;
		        shopInfo.shopPhotoKey = PhotoFile.transforms[0].key;
		    }

		    let shopData = await dbModel.dbOverlap2(shop.findShopName,shopToken.ObjectId); //쇼핑몰 정보가지고오기 
		    if(shopData[0].shopPwd == 0){
		        return res.send('존재하지 않는 아이디입니다.');
		    }else{
		        if(newPwd){
		            let loginSameResult = await bcrypt.hashPwCompare(req.body.shopPwd,shopData[0].shopPwd);
		            let loginResult = await bcrypt.hashPwCompare1(req.body.shopNewPwd,shopData[0].shopPwd);
		            shopInfo.shopPwd = bcrypt.hashPw(req.body.shopNewPwd);
		        }
		    }

		    if(PhotoFile){   
		        var deleteData = shopData[0].shopphoto;
		        var data = [];
		        if(deleteData != 'https://s3.ap-northeast-2.amazonaws.com/showroompark/origin/shop/default/default_Img')  
		            data.push({Key: shopData[0].shopPhotoKey})
		            await multer.deleteFile(data);
		    }

		    let shop_shopName = [shopInfo,shopToken.ObjectId];
		    let shopEdit = await dbModel.dbOverlap2(shop.editShop.editShop,shop_shopName);
		    output.msg ='쇼핑몰 수정 성공';
		    res.setHeader('shopToken', shopToken.userToken);
		}
		res.json(output);
	}catch(e){
		output.msg = 'fail';
		output.data = e.message;
		res.setHeader('shopToken',req.headers.shoptoken);
		res.json(output);
	}
};


//쇼핑몰 로그인
exports.loginShop = async function (req, res, next) {
	try{
	    let shopInfo = {
	        shopName : req.body.shopName,
	        shopPwd : req.body.shopPwd
	    };
	    
	    let shopIdCheck = await dbModel.dbOverlap2(shop.findShopName,shopInfo.shopName);
	    if(shopIdCheck.length == 0){ 
	        res.json({ msg: '존재 하지않는 아이디입니다.' });
	    }

	    let loginResult = await bcrypt.hashPwCompare(req.body.shopPwd,shopIdCheck[0].shoppwd);
	    let shopToken = await jsonWebToken.userTokenCreate(shopInfo.shopName);

	    output.msg='로그인 성공';
	    res.setHeader('shopToken', shopToken);
	    res.json(output);
	}catch(e){
		output.msg = 'fail';
		output.data = e.message;	
		res.json(output);
	}
};


exports.joinshop=function(req,res,next){
	try{
	    let shopInfo = {
	        shopName: req.body.shopName,
	        shopAddress: req.body.shopAddress,
	        shopUrl: req.body.shopUrl,
	        shopEmail: req.body.shopEmail,
	        shopAdminName: req.body.shopAdminName,
	        shopAdminPhone: req.body.shopAdminPhone
	    }
	      
	    nodemailer.joinshop(shopInfo,function(err,result){
	        if(result==1){
	            res.json("success");
	        }else{
	            res.json("fail")
	        }
	    });
	}catch(e){
		output.msg = 'fail';
		output.data = e.message;
		res.json(output);
	}
}