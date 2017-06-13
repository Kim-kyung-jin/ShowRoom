const schedule=require('node-schedule');
const mongoHelper=require('./utils/db_mongoose');
const Board = require('./controllers/board');
const SelectBoard = require('./controllers/selectBoard');
const myShowRoom = require('./controllers/myShowRoom');
const safeHandler = require('./utils/safeHandler.js');

const dbModel = require('./utils/dbOverlap');
// 날씨 데이터 
const request = require('request-promise');
const version=1;
const stnid=108;
const Appkey="&appKey=453cc47b-b855-3aa7-af60-ae779b6e8481&format=json";

const todayBestUserCodytime = '00 04 12 * * 0-6';
const deleteBoardtime = '30 24 16 * * 0-6';
const deleteSelectBoardtime = '00 24 16 * * 0-6';

const codyRankTime = '* * * * * 0-6';
const cody10RankTime = '* * 10 * * 0-6';
const cody20RankTime = '* * 10 * * 0-6';
const cody30RankTime = '* * 10 * * 0-6';
const cody40RankTime = '* * 10 * * 0-6';
const shopRankTime = '* * 04 * * 0-6';

mongoHelper.connect(function(error){
        if(error) throw error;
    });

function today(){
	schedule.scheduleJob(todayBestUserCodytime, safeHandler.safeHandler(async function(){
     	await Board.todayBestUserCody();
 	}));
}
function deleteBoard() {
	schedule.scheduleJob(deleteBoardtime, safeHandler.safeHandler(async function() {
		await Board.deleteBoardSche();
	}));
}
function deleteSelectBoard() {
	schedule.scheduleJob(deleteSelectBoardtime, safeHandler.safeHandler(async function() {
		await SelectBoard.deleteSelectBoardSche();
	}));
}

function codyRank(){ //코디순위
	schedule.scheduleJob(codyRankTime, safeHandler.safeHandler(async function(){
     	await myShowRoom.codyRank();
 	}));
}

function cody10Rank(){ //10 코디순위
	schedule.scheduleJob(cody10RankTime, safeHandler.safeHandler(async function(){
     	await myShowRoom.cody10Rank();
 	}));
}

function cody20Rank(){ //20대 코디순위
	schedule.scheduleJob(cody20RankTime, safeHandler.safeHandler(async function(){
     	await myShowRoom.cody20Rank();
 	}));
}

function cody30Rank(){ //30대 코디순위
	schedule.scheduleJob(cody30RankTime, safeHandler.safeHandler(async function(){
     	await myShowRoom.cody30Rank();
 	}));
}

function cody40Rank(){ //40대 코디순위
	schedule.scheduleJob(cody40RankTime, safeHandler.safeHandler(async function(){
     	await myShowRoom.cody40Rank();
 	}));
}

function shopRank(){ //쇼핑몰 순위
	schedule.scheduleJob(shopRankTime, safeHandler.safeHandler(async function(){
     	await myShowRoom.shopRank();
 	}));
}

const options = [
	{ method:'GET',uri:'http://apis.skplanetx.com/weather/current/hourly?version='+version+'&lon='+126.977969+'&stnid='+stnid+'&lat='+37.566535+Appkey }
	{ method:'GET',uri:'http://apis.skplanetx.com/weather/current/hourly?version='+version+'&lon='+129.075642+'&stnid='+stnid+'&lat='+35.179554+Appkey }
	{ method:'GET',uri:'http://apis.skplanetx.com/weather/current/hourly?version='+version+'&lon='+128.601445+'&stnid='+stnid+'&lat='+35.871435+Appkey },
	{ method:'GET',uri:'http://apis.skplanetx.com/weather/current/hourly?version='+version+'&lon='+126.705206+'&stnid='+stnid+'&lat='+37.456256+Appkey },
	{ method:'GET',uri:'http://apis.skplanetx.com/weather/current/hourly?version='+version+'&lon='+126.852601+'&stnid='+stnid+'&lat='+35.159545+Appkey },
	{ method:'GET',uri:'http://apis.skplanetx.com/weather/current/hourly?version='+version+'&lon='+127.384548+'&stnid='+stnid+'&lat='+36.350412+Appkey },
	{ method:'GET',uri:'http://apis.skplanetx.com/weather/current/hourly?version='+version+'&lon='+127.073139+'&stnid='+stnid+'&lat='+37.550260+Appkey },
	{ method:'GET',uri:'http://apis.skplanetx.com/weather/current/hourly?version='+version+'&lon='+129.311360+'&stnid='+stnid+'&lat='+35.538377+Appkey },
	{ method:'GET',uri:'http://apis.skplanetx.com/weather/current/hourly?version='+version+'&lon='+127.060507+'&stnid='+stnid+'&lat='+37.903411+Appkey },
	{ method:'GET',uri:'http://apis.skplanetx.com/weather/current/hourly?version='+version+'&lon='+127.028601+'&stnid='+stnid+'&lat='+37.263573+Appkey },
	{ method:'GET',uri:'http://apis.skplanetx.com/weather/current/hourly?version='+version+'&lon='+128.170699+'&stnid='+stnid+'&lat='+38.069468+Appkey },
	{ method:'GET',uri:'http://apis.skplanetx.com/weather/current/hourly?version='+version+'&lon='+128.660951+'&stnid='+stnid+'&lat='+37.380755+Appkey },
	{ method:'GET',uri:'http://apis.skplanetx.com/weather/current/hourly?version='+version+'&lon='+127.925950+'&stnid='+stnid+'&lat='+36.991011+Appkey },
	{ method:'GET',uri:'http://apis.skplanetx.com/weather/current/hourly?version='+version+'&lon='+127.729483+'&stnid='+stnid+'&lat='+36.489457+Appkey },
	{ method:'GET',uri:'http://apis.skplanetx.com/weather/current/hourly?version='+version+'&lon='+126.628328+'&stnid='+stnid+'&lat='+36.893611+Appkey },
	{ method:'GET',uri:'http://apis.skplanetx.com/weather/current/hourly?version='+version+'&lon='+127.098745+'&stnid='+stnid+'&lat='+36.187066+Appkey },
	{ method:'GET',uri:'http://apis.skplanetx.com/weather/current/hourly?version='+version+'&lon='+126.957599+'&stnid='+stnid+'&lat='+35.948286+Appkey },
	{ method:'GET',uri:'http://apis.skplanetx.com/weather/current/hourly?version='+version+'&lon='+127.28266+'&stnid='+stnid+'&lat='+35.611055+Appkey },
	{ method:'GET',uri:'http://apis.skplanetx.com/weather/current/hourly?version='+version+'&lon='+128.729357+'&stnid='+stnid+'&lat='+36.568354+Appkey },
	{ method:'GET',uri:'http://apis.skplanetx.com/weather/current/hourly?version='+version+'&lon='+129.224748+'&stnid='+stnid+'&lat='+35.856172+Appkey },
	{ method:'GET',uri:'http://apis.skplanetx.com/weather/current/hourly?version='+version+'&lon='+128.165800+'&stnid='+stnid+'&lat='+35.566576+Appkey },
	{ method:'GET',uri:'http://apis.skplanetx.com/weather/current/hourly?version='+version+'&lon='+128.322246+'&stnid='+stnid+'&lat='+34.973149+Appkey },
	{ method:'GET',uri:'http://apis.skplanetx.com/weather/current/hourly?version='+version+'&lon='+126.498302+'&stnid='+stnid+'&lat='+33.489011+Appkey },
	{ method:'GET',uri:'http://apis.skplanetx.com/weather/current/hourly?version='+version+'&lon='+126.560076+'&stnid='+stnid+'&lat='+33.254120+Appkey }
];

const weatherdata = [
 	'Seoul','Busan','Dae-gu','Incheon','Gwangju','Daejeon','Sejong',
    'Ulsan','north-gyeong-gi','south-gyeong-gi','north-Gangwon',
    'south-Gangwon','north-Chungbuk','south-Chungbuk','north-Chungnam',
    'south-Chungnam','north-Jeonbuk','south-Jeonbuk','north-Gyeongbuk',
    'south-Gyeongbuk','north-Gyeongnam','south-Gyeongnam','north-Jeju',
    'south-Jeju'
]; 


const weatherdata2 = [];
var weaherInsert;
var weatherData = {};
var city
function weather(){
	schedule.scheduleJob(test,async function(){
		for(var i =0 ; i<options.length; i++){
			await request(options[i]).then(function(response){
				var result1 = JSON.parse(response);
				city = weatherdata[i];
		        weatherData.tc = Math.round(Number(result1.weather.hourly[0].temperature.tc));
		        weatherData.tmax = Math.round(Number(result1.weather.hourly[0].temperature.tmax));
		        weatherData.tmin = Math.round(Number(result1.weather.hourly[0].temperature.tmin));
			});   
			console.log(typeof(weatherData.tc))
			console.log(weatherData.tc)
			await dbModel.dbOverlap2('update weather set ? where city=?',[weatherData,city]);
		}
	});

}
today();
deleteBoard();
deleteSelectBoard();
codyRank();
cody10Rank();
cody20Rank();
cody30Rank();
cody40Rank();
shopRank();
weather();
