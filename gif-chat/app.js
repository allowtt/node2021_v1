const express = require('express');
const path = require('path');
const morgan = require('morgan');   //요청에대한거 기록 콘솔에 222333334444

//44455566677788999000
//123123123

const cookieParser = require('cookie-parser');
const session = require('express-session');
const nunjucks = require('nunjucks');
const dotenv = require('dotenv');

dotenv.config();
const webSocket = require('./socket');
const indexRouter = require('./routes');

const app = express();
app.set('port', process.env.PORT || 8005);
app.set('view engine', 'html');
nunjucks.configure('views', {
    express: app,
    watch: true,
});

app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({
    extended: false,
}));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
        httpOnly: true,
        secure: false,
    }
}));

app.use('/', indexRouter);

app.use((req, res, next) => {
    const error = new Error(`${req.method}${req.url} 라우터가 없습니다.`);
    error.status(404);
    next(error);
});

app.use((err, req, res, next) => {
    res.locals.message = err.messgae;
    res.locals.error = process.env.NODE_ENV !== 'production' ? err : {};
    res.status(err.status || 500);
    res.render('error');
});

const server = app.listen(app.get('port'), () => {
    console.log(app.get('port'), '포트에서 대기중');
});

webSocket(server);