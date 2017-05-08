const safeHandler = require('../utils/safeHandler');
const shop = require('../controllers/shop');


exports.setRequestUrl=function(app){
	//app.post('/shop', shop.addShop);
    app.post('/shop/login', safeHandler.safeHandler(shop.loginShop));  //쇼핑몰 로그인
    app.get('/shop', safeHandler.safeHandler(shop.showShopList));  //등록쇼핑몰 보기
    app.post('/shop', safeHandler.safeHandler(shop.addShop));  //쇼핑몰등록 하기(회원가입)
    app.put('/shop', safeHandler.safeHandler(shop.editShop));  //쇼핑몰 정보수정
    app.post('/joinshop',safeHandler.safeHandler(shop.joinshop));
};









