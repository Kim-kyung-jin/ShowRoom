const safeHandler = require('../utils/safeHandler');
const shop = require('../controllers/shop');
const multer = require('../utils/multers3');

exports.setRequestUrl=function(app){
    	app.post('/shop',multer.shopPhoto, shop.addShop);  //쇼핑몰등록 하기(회원가입)
    	app.post('/shop/login',shop.loginShop);  //쇼핑몰 로그인
	app.put('/shop',multer.newShopPhoto,shop.editShop);  //쇼핑몰 정보수정
	app.post('/joinshop',safeHandler.safeHandler(shop.joinshop));
    	app.get('/shop',safeHandler.safeHandler(shop.showShopList));  //등록쇼핑몰 보기
};
