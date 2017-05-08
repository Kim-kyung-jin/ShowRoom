const cluster=require('cluster');
const express=require('express')
const cookieParser=require('cookie-parser');
const bodyParser=require('body-parser');
const morgan = require('morgan');
const methodOverride=require('method-override');
const favicon=require('serve-favicon');
const config=require('config');
const path=require('path');
const multer=require('multer');
const moment=require('moment');
const fs=require('fs');
const http=require('http');
const https=require('https');
const passport=require('passport');
const mkdirp = require('mkdirp');
const randomstring =require('randomstring');
const cookieSession = require('cookie-session');
const jsonWebToken=require('./utils/jsonWebToken');
const request = require('request');
const safeHandler = require('./utils/safeHandler');




const AgentOptions = {
  url: 'http://localhost:3000/test',
  headers: {
    'User-Agent': 'TEST IP'
  }
};
moment.locale("ko");
const mongoHelper=require('./utils/db_mongoose'),
      userHelper=require('./routes/userRouter'),
      shopHelper   = require("./routes/shopRouter"),
      categoryHelper   = require("./routes/categoryRouter"),
      clothHelper   = require("./routes/clothRouter"),
      codyHelper   = require("./routes/codyRouter"),
      myShowRoomHelper=require('./routes/myShowRoomRouter'),
      boardHelper=require('./routes/boardRouter'),
      selectBoardHelper=require('./routes/selectRouter');
	  
const options={
		pfx: fs.readFileSync('goallshow.com_20170221N1MK.pfx'),
	    passphrase: '3x6i6h'
};



if(cluster.isMaster) {
    var numWorkers = require('os').cpus().length;
    console.log('Master cluster setting up ' + numWorkers + ' workers...');

    for(var i = 0; i < numWorkers; i++) {
        cluster.fork();
    }

    cluster.on('online', function(worker) {
        console.log('Worker ' + worker.process.pid + ' is online');
    });

    cluster.on('exit', function(worker, code, signal) {
        console.log('Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal);
        console.log('Starting a new worker');
        cluster.fork();
    });
}else{
    const app=express();
    const saveDay=new moment().format("YYYY-MM-DD");
    const storage=multer.diskStorage({
        destination:function(req,file,cb){        	
            if(file.fieldname=='userPhoto'){
                var saveFolder='./public/uploads/userPhoto/'+saveDay;
                mkdirp(saveFolder, function (err) {
                    if (err) console.error(err)
                    else console.log('pow!')
                });
                cb(null,saveFolder);
            }
            else if(file.fieldname=='boardPhoto'){
                var saveFolder='./public/uploads/boardPhoto/'+saveDay;
                mkdirp(saveFolder, function (err) {
                    if (err) console.error(err)
                    else console.log('pow!')
                });
                cb(null,saveFolder);
            }
            else if(file.fieldname=='leftPhoto'){
                var saveFolder='./public/uploads/leftPhoto/'+saveDay;
                mkdirp(saveFolder, function (err) {
                    if (err) console.error(err)
                    else console.log('pow!')
                });
                cb(null,saveFolder);
            }
            else if(file.fieldname=='rightPhoto'){
                var saveFolder='./public/uploads/rightPhoto/'+saveDay;
                mkdirp(saveFolder, function (err) {
                    if (err) console.error(err)
                    else console.log('pow!')
                });
                cb(null,saveFolder);
            }
            else if(file.fieldname=='shopPhoto'){
                var saveFolder='./public/uploads/shopPhoto/'+req.body.shopName;
                mkdirp(saveFolder, function (err) {
                    if (err) console.error(err)
                    else console.log('pow!')
                });
                cb(null,saveFolder);
            }
            else if(file.fieldname=='newShopPhoto'){
            	let token = async function(){ 
                    let shopToken = await jsonWebToken.TokenCheck(req.body.shopToken);
        			let shopName = shopToken.ObjectId;
        			let saveFolder='./public/uploads/shopPhoto/'+shopName;
	                mkdirp(saveFolder, function (err) {
	                    if (err) console.error(err)
	                    else console.log('pow!')
	                });
	                cb(null,saveFolder);
                }
                token();
                // let promise = jsonWebToken.TokenCheck(req.body.shopToken);
                // promise.then(function(result){
                //     let shopName = result.ObjectId;
                //     let saveFolder='./public/uploads/shopPhoto/'+shopName;
                //     mkdirp(saveFolder, function (err) {
                //         if (err) console.error(err)
                //         else console.log('pow!')
                //     });
                //     cb(null,saveFolder);
                // });  
            }
            else if(file.fieldname=='clothPhoto'){
                let token =async function(){ 
                    let shopToken = await jsonWebToken.TokenCheck(req.body.shopToken);
                    //return console.log(shopToken+'aaaaaa')
                    let shopName = shopToken.ObjectId;
                    var saveFolder='./public/uploads/cloth/'+shopName;
                    mkdirp(saveFolder, function (err) {
                        if (err) console.error(err)
                        else console.log('pow!')
                    });
                    cb(null,saveFolder);   
                }
                token()
            }
            else if(file.fieldname=='codyPhoto'){
                let token =async function(){ 
                let shopToken = await jsonWebToken.TokenCheck(req.body.shopToken);
                let shopName = shopToken.ObjectId;
                var saveFolder='./public/uploads/cody/'+shopName;
                mkdirp(saveFolder, function (err) {
                    if (err) console.error(err)
                    else console.log('pow!')
                });
                    cb(null,saveFolder);   
                }
                token()
            }
            else 
                cb(new Error("error"));
        },
        filename:function(req,file,cb){
        	var randomStr=randomstring.generate(6);
            cb(null,file.fieldname+'-'+randomStr+'-'+Date.now()+path.extname(file.originalname));
        }
    });
    //app.set('port',(process.env.PORT || 3000));
    app.use(function (req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
     	res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,DELETE");
      	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
      	next();
    });
    process.on("unhandledRejection", (reason) => {
        console.log(reason)
    });
    require('./controllers/passport')(passport);
    app.use(cookieSession({
        name:'session',
        keys:['key1']
    }));
    app.use(morgan('dev'));
    app.use(cookieParser());
    app.use(bodyParser.json({limit:'5mb'}));
    app.use(multer({
        storage:storage,
        limits:{fileSize:5120000},
        fileFilter: function (req, file, cb) {
            if (file.mimetype == 'image/jpeg' || file.mimetype == 'image/png') {
                cb(null, file);
            }
            else if(file==null){
                cb(null,file);
                console.log("널값임");
                //cb(new Error('error'));
            }
        }
        }).any());

    app.use(methodOverride('X-HTTP-Method-Override'));
    app.use(express.static(__dirname+'/public/'));
    app.use(express.static(__dirname+'/dist'));
    app.use(passport.initialize());
    app.use(passport.session());
    
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
    http.createServer(app).listen(3000, function(){  
        console.log("Http server listening on port " + config.Customer.port);
    });

    // https 보안 추후 적용
    https.createServer(options,app).listen(3001,function(){
        console.log("Https server listening on port 443");
    });
    app.get('/*',function(req,res){
    	res.sendFile(path.join(__dirname, './dist/index.html'));
    });

    function handleError(err, req, res, next) {
        if(err.code)
            res.status(err.code);
        else
            res.status(500);
            console.log(err);
            res.send({msg:err.message});
    }
    
}