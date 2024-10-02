var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var mongoose = require('mongoose');

require("./components/user/UserModel");
require("./components/menu/MenuModel");
require("./components/table/TableModel");
require("./components/booking/BookingModel");
require("./components/timeline/TimelineModel");
require("./components/category/CategoryModel");
require("./components/order/OrderModel");

var userRouter = require("./routes/api/UserAPI");
var menuRouter = require("./routes/api/MenuAPI");
var tableRouter = require("./routes/api/TableAPI");
var bookingRouter = require("./routes/api/BookingAPI");
var timelineRouter = require("./routes/api/TimelineAPI");
var categoryRouter = require("./routes/api/CategoryAPI");
var orderRouter = require("./routes/api/OrderAPI");

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//connect database
mongoose.connect('mongodb+srv://locdaynha:DpOctSj0vCPcdF18@restaurant.vb2di.mongodb.net/')
  .then(() => console.log('>>>>>>>>>> DB Connected!!!!!!'))
  .catch(err => console.log('>>>>>>>>> DB Error: ', err));

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.use('/user', userRouter);
app.use('/menu', menuRouter);
app.use('/table', tableRouter);
app.use('/booking', bookingRouter);
app.use('/timeline', timelineRouter);
app.use('/category', categoryRouter);
app.use('/order', orderRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
