const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
// const{ isLoggedIn, isNotLoggedIn} = require('./middlewares');
const User = require('../models/user');
const {isLoggedIn, isNotLoggedIn} = require('./middlewares');

const router = express.Router();

router.post('/join', isNotLoggedIn, async (req, res, next) => {
    const {email, nick, password} = req.body;
    try {
        const exUser = await User.findOne({where : {email}});
        if(exUser) {
            return res.redirect('/join?error=exist');
        }
        const hash = await bcrypt.hash(password, 12);
        await User.create({
            email,
            nick,
            password: hash,
        });
        return res.redirect('/');

    }catch (error) {
        console.error(error);
        return next(error);

    }
});

//로그인시
router.post('/login', isNotLoggedIn, (req, res, next) => {
    passport.authenticate('local', (authError, user, info) => {
        if (authError) {
            console.error(authError);
            return next(authError);
        }
        if(!user) {
            return res.redirect(`/?loginError=${info.message}`);
        }
        return req.login(user, (loginError) => {    //req.login하면 passport/index에 시리얼라이즈유저로 간다.
            if(loginError) {
                console.error(loginError);
                return next(loginError);
            }
            //세션 쿠키 브라우저로 보내는게 숨겨져있다.
            return res.redirect('/');
        });
    })(req, res, next); //미들웨어 내의 미들웨어에는 (req, res, next)를 붙인다.
});


router.get('/kakao', passport.authenticate('kakao'));

router.get('/kakao/callback', passport.authenticate('kakao', {
    failureRedirect: '/',
}), (req, res) => {
    res.redirect('/');
});

router.get('/logout', isLoggedIn, (req, res) => {
    req.logout();
    req.session.destroy();
    res.redirect('/');
});

module.exports = router;