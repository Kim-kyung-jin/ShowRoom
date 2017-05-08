const config=require('config');
const bcrypt=require('../utils/bcrypt');
const shop = require('../utils/shopController');   
const dbModel = require('../utils/dbOverlap');  
const output = new Object();
const jsonWebToken=require('../utils/jsonWebToken');
const nodemailer=require('../utils/nodemailer');
const fs=require('fs');
//쇼핑몰 보기
exports.showShopList = async function (req, res, next) {
    let showShop = await dbModel.dbOverlap(shop.showShopList);
    output.msg = "쇼핑몰 보기 성공";
    output.data = showShop;
    res.json(output);
};

//let userInfo = await UserController.getUserFindObjectId(userIdCheckdata);
//쇼핑몰 등록
exports.addShop = async function(req, res, next){
    let shopIdCheck = await dbModel.dbOverlap2(shop.findShopName,req.body.shopName); //아이디 중복체크 
    if(shopIdCheck.length >0){ 
        return res.status(400).send('아이디 중복'); 
    }

	let shopPwd = req.body.shopPwd;
	let PhotoFile=req.files[0]; 
    let shopPhoto;

	if(PhotoFile){
        shopPhoto = config.Customer.imageurl+PhotoFile.destination.substr(8,PhotoFile.destination.length)+'/'+PhotoFile.filename
	}else{
		shopPhoto = config.Customer.imageurl+'/uploads/shopPhoto/default/default_image.jpg'
	}	
    
	let shopInfo = {
        shopName : req.body.shopName,
    	shopPwd : bcrypt.hashPw(shopPwd),
    	shopEmail : req.body.shopEmail,
    	shopUrl : req.body.shopUrl,
    	shopAddress : req.body.shopAddress,
    	shopPhoto : shopPhoto,
        shopPhone : req.body.shopPhone
	}; 
    let [shopInsert] = 
    await Promise.all([dbModel.dbOverlap2(shop.addShop.shopInsert,shopInfo)]); //await 여러개 동시에 //데이터입력 
    output.msg = "회원가입 성공";
    res.json(output);
};



//쇼핑몰 수정
exports.editShop = async function (req, res, next){
    let shopIdCheckdata =  req.body.shopToken;
    let shopToken = await jsonWebToken.TokenCheck(req.body.shopToken); //토큰확인 
	let PhotoFile=req.files[0]; 
    let newPwd = req.body.newShopPwd		
	let shopInfo = {
    	shopEmail : req.body.shopEmail,
    	shopUrl : req.body.shopUrl,
    	shopAddress : req.body.shopAddress,
        shopPhone : req.body.shopPhone
	};

	if(PhotoFile){
		shopInfo.shopPhoto = config.Customer.imageurl+PhotoFile.destination.substr(8,PhotoFile.destination.length)+'/'+PhotoFile.filename
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

        var deleteData = 'public/'+shopData[0].shopPhoto.substr(15,shopData[0].shopPhoto.length);
        if(!(deleteData == 'public/uploads/shopPhoto/default/default_image.jpg')){
            fs.unlink(deleteData, function (err) {
                if (err){ 
                    console.log('파일 삭제 실패 :',err);
                    return res.send('파일 삭제 실패 !!');
                }
                else{
                    console.log('과거 shopPhoto 삭제완료');
                } 
            });
        }
    }

    let shop_shopName = [shopInfo,shopToken.ObjectId];
    let shopEdit = await dbModel.dbOverlap2(shop.editShop.editShop,shop_shopName);

    output.msg ='쇼핑몰 수정 성공';
    output.shopToken =shopToken.userToken;
    res.json(output);
};


//쇼핑몰 로그인
exports.loginShop = async function (req, res, next) {
    
	var shopInfo = {
		shopName : req.body.shopName,
	  	shopPwd : req.body.shopPwd
	};
    let shopIdCheck = await dbModel.dbOverlap2(shop.findShopName,shopInfo.shopName);
    if(shopIdCheck.length == 0){ 
        res.json({ msg: '존재 하지않는 아이디입니다.' });
    }

    let loginResult = await bcrypt.hashPwCompare(req.body.shopPwd,shopIdCheck[0].shopPwd);
    let shopToken = await jsonWebToken.userTokenCreate(shopInfo.shopName);
    output.msg='로그인 성공';
    output.shopToken=shopToken;
    res.json(output);
};


exports.joinshop=function(req,res,next){
	console.log(req.body.shopName);
	var shopInfo = {
		shopName: req.body.shopName,
		shopAddress: req.body.shopAddress,
		shopUrl: req.body.shopUrl,
		shopEmail: req.body.shopEmail,
		shopAdminName: req.body.shopAdminName,
		shopAdminPhone: req.body.shopAdminPhone
	}
	console.log(shopInfo);
	nodemailer.joinshop(shopInfo,function(err,result){
		if(result==1){
			res.json("success");
		}else{
			res.json("fail")
		}
	});
}






