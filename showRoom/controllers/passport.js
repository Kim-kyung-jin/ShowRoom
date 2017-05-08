// config/passport.js

// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy
const bcrypt=require('../utils/bcrypt');
// load up the user model
const User=require('../model/Userdb.js');
const UserController=require('../utils/userController');
// load the auth variables
const config=require('config');
// expose this function to our app using module.exports
module.exports = function(passport) {

	// =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        console.log("serializeUser");
        done(null, user);
    });

    // used to deserialize the user
    passport.deserializeUser(function(user, done) {
        console.log("deserializeUser");
        done(null,user);
        // UserController.getFacebookUserId(id,function(err,result){
        //     done(null,result);
        // });
    });

   

    // =========================================================================
    // FACEBOOK ================================================================
    // =========================================================================
    passport.use(new FacebookStrategy({

        // pull in our app id and secret from our auth.js file
        clientID:config.Customer.facebook.clientID,
        clientSecret:config.Customer.facebook.clientSecret,
        callbackURL:config.Customer.facebook.callbackURL,
        profileFields:config.Customer.facebook.profileFields

    },

    // facebook will send back the token and profile
    function(token, refreshToken, profile, done) {

        // asynchronous
        process.nextTick(function() {
                var user=new User();
                var providerData=profile._json;
                var providerUserProfile={
                    id:profile.id,
                    fullName:profile.displayName,
                    email:providerData.email,
                    username:profile.displayName,
                    gender:profile.gender,
                    provider:'facebook'
                }
                user.userId=providerData.email;
                user.userFacebookId=profile.id;
                //user.userPwd=bcrypt.hashPw(profile.id);
                user.userLoginType=providerUserProfile.provider;
               
                if(providerUserProfile.email==undefined){
                    console.log("email정보없음");
                    done(null,providerUserProfile);
                }
                else{
                    UserController.getUserFindId(user.userId,function(err,result){
                        if(err)
                            console.log(err);
                        else if(result!=0){
                            console.log("not null!!!");
                            return done(null,providerUserProfile);
                        }
                        else{
                            console.log("nulll")
                            UserController.saveUser(user,function(err,results){
                                return done(null,providerUserProfile);
                            });
                        }
                    });
                }
            });
    }));
    //구글인증 및 가입
    passport.use(new GoogleStrategy({
        clientID:     config.Customer.google.clientID,
        clientSecret: config.Customer.google.clientSecret,
        callbackURL: config.Customer.google.callbackURL,
        passReqToCallback   : true
      },
      function(request, accessToken, refreshToken, profile, done) {
            var user=new User();
            var providerData=profile._json;
            providerData.accessToken=accessToken;
            providerData.refreshToken=refreshToken;
            var providerUserProfile = {
                fullName: profile.displayName,
                email: profile.emails[0].value,
                username: profile.displayName,
                gender:profile.gender,
                provider: 'google',
                accessToken:providerData.accessToken,
                refreshToken:providerData.refreshToken
            }
            console.log(profile);
            user.userId=providerUserProfile.email;
            //user.userPwd=bcrypt.hashPw(profile.id);
            user.userLoginType=providerUserProfile.provider;
            
            //console.log(request);
            //console.log(user);
            if(providerUserProfile.email==undefined){
                console.log("email정보없음");
                done(null);
            }
            else{
                UserController.getUserFindId(user.userId,function(err,result){
                    if(err)
                        console.log(err);
                    else if(result!=0){
                        console.log("not null!!!");
                        return done(null,providerUserProfile);
                    }
                    else{
                        console.log("nulll")
                        UserController.saveUser(user,function(err,results){
                            return done(null,providerUserProfile);
                        });
                    }
                });
            }
        }
    ));

};
