var cody = require('../controllers/cody');
exports.setRequestUrl=function(app){
    app.post('/adminCody', cody.addCody);  //코디 등록 하기  
    app.put('/cody/:codyId', cody.editCody);  //코디 수정하기  
    app.post('/codyDelete/:codyId', cody.removeCody);  //코디 삭제 
    app.post('/shopCodyList', cody.showWebCodyList); //코디보기(쇼핑몰) (웹페이지)
    app.post('/showShopCody/:codyId', cody.showDetailWebCody);  //코디상세보기 (웹페이지)

	app.post('/showDetailCody/:codyId', cody.showDetailCody);  ///코디상세보기 (앱)
    app.post('/codyList', cody.showCodyList);  //전체코디보기 필터 (통합)
    app.post('/cody/:codyId/codyMybag',cody.userCodyMybag);//코디 즐겨찾기 (o)
    
};
