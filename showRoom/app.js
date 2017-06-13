const express=require('express'); 
const cookieParser=require('cookie-parser');
const bodyParser=require('body-parser');
const morgan = require('morgan');
const config=require('config');
const moment=require('moment');
const http=require('http');
const fs = require('fs');
const cookieSession = require('cookie-session');

moment.locale("ko");

const mongoHelper=require('./utils/db_mongoose')
	 ,userHelper=require('./routes/userRouter')
	 ,shopHelper   = require("./routes/shopRouter")
	 ,categoryHelper   = require("./routes/categoryRouter")
	 ,clothHelper   = require("./routes/clothRouter")
	 ,codyHelper   = require("./routes/codyRouter")
	 ,myShowRoomHelper=require('./routes/myShowRoomRouter')
	 ,boardHelper=require('./routes/boardRouter')
 	 ,selectBoardHelper=require('./routes/selectRouter');

const app=express();
app.use(function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,DELETE");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, shopToken");
	res.setHeader("Access-Control-Expose-Headers","shopToken");
	next();
});

app.use(cookieSession({
	name:'session',
	keys:['key1']
}));

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(__dirname+'/public/files'));

shopHelper.setRequestUrl(app);
userHelper.setRequestUrl(app);
boardHelper.setRequestUrl(app);
categoryHelper.setRequestUrl(app);
clothHelper.setRequestUrl(app);
codyHelper.setRequestUrl(app);
myShowRoomHelper.setRequestUrl(app);
selectBoardHelper.setRequestUrl(app);

mongoHelper.connect(function(error){
	if(error) throw error;
});

app.on('close',function(errno){
	mongoHelper.disconnect(function(err){});
});

http.createServer(app).listen(3001, function(){  
	console.log("Http server listening on port " + config.Customer.port);
});

app.get('/', function(req,res) {
	res.status(200).send("success");
});

app.use(function(err,req,res,next) {
	return res.status(500).json({
		error: err.message
	});
});

process.on("unhandledRejection", (reason) => {
	console.log(reason);
});
