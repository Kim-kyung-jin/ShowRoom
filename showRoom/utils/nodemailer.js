const nodemailer=require('@nodemailer/pro');
const config=require('config');
let transporter = nodemailer.createTransport({
    service: config.Customer.googleInfo.server,
    auth: {
        user: config.Customer.googleInfo.user,
        pass: config.Customer.googleInfo.pass
    }
});

exports.userEmailPwd=function(userId){
	var mailOptions={
			from: userId,
			to:config.Customer.googleInfo.from,
			subject:"귀하의 비밀번호를 변경해주세요",
			text:"안녕하세요",
			html:' <h1>HTML보내기 테스트</h1>'
		}
	transporter.sendMail(mailOptions, function(error, info){
		    if(error){
		        return console.log(error);
		    }
		    console.log('Message sent: ' + info.response);
		});
}
exports.joinshop=function(shopInfo,callback){
	var mailOptions={
			from: shopInfo.shopEmail,
			to:config.Customer.googleInfo.from,
			subject:"쇼핑몰입점문의",
			text:"안녕하세요",
			html:` <html>
<head>
  <title>입점문의메일</title>
  <style>
    p{
    padding-left: 6px;
}
.container{
    padding-right:15px;
    padding-left:15px;
    margin-right:auto;
    margin-left:auto
}
.container:before,.container:after{
    display:table;
    content:" "
}
.container:after{
    clear:both
}
.container:before,.container:after{
    display:table;
    content:" "
}
.container:after{
    clear:both
}
blockquote{
    border-left:none
}

.quote-badge{
    background-color: rgba(0, 0, 0, 0.2);   
}
@media(min-width:768px){
    .container{
        width:750px
    }
}
@media(min-width:992px){
    .container{
        width:970px
    }
}
@media(min-width:1200px){
    .container{
        width:1170px
    }
}
.container .jumbotron{
    border-radius:6px
}
.jumbotron .container{
    max-width:100%
}
@media screen and (min-width:768px){
    .jumbotron{
        padding-top:48px;
        padding-bottom:48px
    }
    .container .jumbotron{
        padding-right:60px;
        padding-left:60px
    }
    
}

.quote-box{
    
    overflow: hidden;
    margin-top: -50px;
    padding-top: -100px;
    border-radius: 17px;
    background-color: #4ADFCC;
    margin-top: 25px;
    color:white;
    width: 700px;
    box-shadow: 2px 2px 2px 2px #E0E0E0;
    
}

.quotation-mark{
    
    margin-top: -10px;
    font-weight: bold;
    padding-top:10px;
    font-size:80px;
    color:white;
    text-align:center;
    
}

.quote-text{
    
    font-size: 19px;
    margin-top: -65px;
}
  </style>
</head>
<body>,
  <div class="container">
    <blockquote class="quote-box">
   
      <p class="quotation-mark">
        쇼핑몰입점문의
      </p>
      <p class="quote-text">
        쇼핑몰이름 : `+shopInfo.shopName+`
      <br>
        쇼핑몰주소 : `+shopInfo.shopAddress+`
      <br>
      	쇼핑몰홈페이지 : `+shopInfo.shopUrl+`
      <br>
      	쇼핑몰이메일 : `+shopInfo.shopEmail+`
      	
      </p>
      <hr>
      <div class="blog-post-actions">
        <p class="blog-post-bottom pull-left">
          쇼핑몰관리자 : `+shopInfo.shopAdminName+`
        <br>
          쇼핑몰연락처 : `+shopInfo.shopAdminPhone+`
        </p>
   
      </div>
    </blockquote>
</div>
</body>
</html>`
		}
	transporter.sendMail(mailOptions, function(error, info){
		    if(error){
		        return console.log(error);
		    }else{
          console.log('Message sent: ' + info.response);
          callback(null,1);
        }
		    
		});
}