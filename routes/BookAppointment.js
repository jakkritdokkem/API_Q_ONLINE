var express = require('express');
var router = express.Router();
var respon = require('../helper/Respon');
var mssql = require('../helper/Connect');

router.post('/createBookAppointment', async (req, res) => {
  try {
    console.log('req.body', req.body);

    const { openScheduleId, userId, note } = req.body;

    res.status(200).send(req.body);
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
