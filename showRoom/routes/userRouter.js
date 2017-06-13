const user=require('../controllers/user');
const safeHandler = require('../utils/safeHandler');
const multer = require('../utils/multers3.js');

exports.setRequestUrl=function(app){
	app.post('/user/Register',multer.userPhoto,user.addUser); //회원가입 
	app.post('/user/login',user.loginUser); //자체로그인
	app.route('/user/pushOnOff') //푸시
	   .get(user.pushOnOffData)
	   .post(user.pushOnOff);
	
	app.route('/user/edit')
	   .get(user.editUserView) //유저수정전데이터
	   .post(multer.userPhoto, user.editUser); // 유저 수정
	app.route('/user/changeUserPwd')
	   .post(user.userPwdChangeCheck) //비밀번호 확인
	   .put(user.userPwdChange);//비밀번호 변경
	app.get('/user/delete', user.outUser); // 유저탈퇴
	app.route('/user/notification')
		.get(user.notification);
	app.post('/joinshop',user.joinshop);	
}