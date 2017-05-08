const user=require('../controllers/user');
const safeHandler = require('../utils/safeHandler');

exports.setRequestUrl=function(app){
	app.post('/userRegister',safeHandler.safeHandler(user.addUser)); //회원가입 
	app.post('/user/checkUserId',safeHandler.safeHandler(user.checkUserId)); //id체크 
	app.post('/user/login',safeHandler.safeHandler(user.loginUser)); //자체로그인
	app.post('/user/changeUserPwd',safeHandler.safeHandler(user.changeUserPwd)); //비밀번호수정
	app.post('/user/changeUserName',safeHandler.safeHandler(user.changeUserName)); //유저이름수정
	app.post('/user/changeUserAge',safeHandler.safeHandler(user.changeUserAge)); //나이바꾸기 
	app.post('/user/changeUserLocation',safeHandler.safeHandler(user.changeUserLocation)); //지역바꾸기
	app.post('/user/changeUserPhoto',user.changeUserPhoto); //사진바꾸기
	app.post('/user/basicUserPhoto',user.basicUserPhoto); //기본사진
	app.post('/user/pushOnOff',safeHandler.safeHandler(user.pushOnOff)); //푸시설정
	app.post('/user/example',safeHandler.safeHandler(user.test));
	app.post('/joinshop',user.joinshop);
	//app.post('/user/addUserexample',safeHandler.safeHandler(user.addUser));
}