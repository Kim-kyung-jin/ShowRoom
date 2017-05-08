const safeHandler = require('../utils/safeHandler');
const cloth = require('../controllers/cloth');

exports.setRequestUrl=function(app){
    app.post('/clothList',safeHandler.safeHandler4(cloth.showClothList));  //등록한 옷 보기(필터)  - 앱
    app.post('/clothDetail/:clothNumber',safeHandler.safeHandler4(cloth.showDetailCloth)); //옷 상세보기  - 앱
    app.post('/cloth/:clothNumber/clothMybag',safeHandler.safeHandler4(cloth.userClothMybag));//옷 즐겨찾기  - 앱    
    //app.post('/cloth/:clothNumber',cloth.detailCloth); //옷 상세보기 - 앱
    
    app.post('/adminCloth', safeHandler.safeHandler4(cloth.addCloth));  //옷 등록 하기 - 웹
    app.put('/adminCloth/:clothNumber',safeHandler.safeHandler4(cloth.editCloth));  //옷 수정하기  - 웹
    app.post('/adminClothDelete/:clothNumber', safeHandler.safeHandler4(cloth.deleteCloth));  //옷 삭제 - 웹 
    app.post('/adminShowDetailBeforeCloth',safeHandler.safeHandler4(cloth.showDetailBeforeCloth)); //옷 상세보기전 데이터 - 웹
    app.post('/adminClothList/:type', safeHandler.safeHandler4(cloth.showClothTypeList));  //타입별 옷보기 - 웹 (없앨예정)
    app.post('/adminCloth/:clothNumber',safeHandler.safeHandler4(cloth.detailCloth)); //옷 상세보기 - 웹
    app.post('/adminClothList', safeHandler.safeHandler4(cloth.showWebClothList));  //등록한 옷 보기  - 웹
};








