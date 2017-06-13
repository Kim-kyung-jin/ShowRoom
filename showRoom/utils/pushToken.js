const config=require('config');
const FCM = require('fcm-push');
const fcm = new FCM(config.Customer.serverKey);

exports.pushFunction = function (userPushToken,type){
    const notification = {};
    const data = {};

    if(type == 1){ // 댓글 
        notification.title = '댓글';
        data.data = '테스트1'
    }else if(type == 2){//좋아요
        notification.title = '좋아요';  
        data.data = '테스트2'
    }else if(type == 3){//역대 
        notification.title = '역대';
        data.data = '테스트3'
    }else if(type == 4){//투표
        notification.title = '투표';
        data.data = '테스트4'
    }else if(type == 5){//랜덤코디
        notification.title = '랜덤코디';
        data.data = '테스트5'
    }

	var message = { 
        to: userPushToken,
        notification: notification,
        data: data
    };

    fcm.send(message, function(err, response){
        if (err) {
        	console.log(err);
            console.log("Something has gone wrong!");
        }else {
            console.log("Successfully sent with response: ", response);
            callback(null,response)
        }
    });
}	