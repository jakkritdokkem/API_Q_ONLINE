var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');

var homeRouter = require('./routes/Home');
var authenRouter = require('./routes/Authentication');
var treatmentRouter = require('./routes/Treatment');
var doctorRouter = require('./routes/Doctor');
var usersRouter = require('./routes/Users');
var openScheduleRouter = require('./routes/OpenSchedule');
var bookAppointmentRouter = require('./routes/BookAppointment');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

app.get('/:imageName', function (req, res) {
  const { imageName } = req.params;
  res.sendFile(`${__dirname}/uploads/${imageName}`);
});

app.use('/', homeRouter);
app.use('/authen', authenRouter);
app.use('/users', usersRouter);
app.use('/treatment', treatmentRouter);
app.use('/doctor', doctorRouter);
app.use('/user', usersRouter);
app.use('/openSchedule', openScheduleRouter);
app.use('/bookAppointment', bookAppointmentRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
