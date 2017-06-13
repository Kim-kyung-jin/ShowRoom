exports.setRequestUrl=function(app){
    var category = require('../controllers/category');
    app.get('/category', category.showCategoryList);  //등록한 카테고리 보기 (O)
    app.post('/category', category.addCategory);  //카테고리 등록 (O)
    app.put('/category/:categoryCode', category.editCategory);  //카테고리 수정  (O)
    app.delete('/category/:categoryCode', category.deleteCategory);  //카테고리 삭제 (O)
};
