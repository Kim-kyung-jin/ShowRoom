var cody = require('../controllers/cody');
const multer = require('../utils/multers3');
const safeHandler = require('../utils/safeHandler');

exports.setRequestUrl=function(app){
    app.post('/adminCody',multer.codyPhoto, safeHandler.safeHandler(cody.addCody));  //코디 등록 하기  
    app.put('/adminCody/:codyId',multer.codyPhoto,safeHandler.safeHandler(cody.editCody));  //코디 수정하기  
    app.delete('/adminCody/:codyId', cody.removeCody);  //코디 삭제 
    app.get('/adminCody', cody.showWebCodyList); //코디보기(쇼핑몰) (웹페이지)
    app.get('/showShopCody/:codyId', safeHandler.safeHandler(cody.showDetailWebCody));  //코디상세보기 (웹페이지)

    app.get('/showDetailCody/:codyId', safeHandler.safeHandler(cody.showDetailCody));  ///코디상세보기 (앱)
    app.post('/codyList', cody.showCodyList);  //전체코디보기 필터 (통합)
    app.post('/cody/:codyId/codyMybag',cody.userCodyMybag);//코디 즐겨찾기 (o)
};