const express = require('express');
const { Post, User } = require('../models');

const router = express.Router();

router.use((req, res, next) => {
    res.locals.user = req.user;
    res.locals.followerCount = req.user ? req.user.Followers.length : 0;
    res.locals.followingCount = req.user ? req.user.Followings.length : 0;
    res.locals.followerIdList = req.user ? req.user.Followings.map(f => f.id) : [];
    next();
});

router.get('/profile', (req, res) => {
    res.render('profile', {title: '내정보 - NodeBird'});
});

router.get('/join', (req, res) => {
    res.render('join', {title:'회원가입 - NodeBird'});
});

router.get('/', async (req, res, next) => {
    try {
      const posts = await Post.findAll({
        include: {
          model: User,
          attributes: ['id', 'nick'],
        },
        order: [['createdAt', 'DESC']],
      });
      res.render('main', {
        title: 'NodeBird',
        twits: posts,
      });
    } catch (err) {
      console.error(err);
      next(err);
    }
  });
// router.get('/', (req, res, next) => {
//     const twits = [];
//     console.log('메인페이지');
//     res.render('main', {
//         title: 'NodeBird',
//         twits,
//         user: req.user,
//     });
// });

module.exports = router;