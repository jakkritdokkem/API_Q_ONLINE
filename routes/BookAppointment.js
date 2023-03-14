var express = require('express');
var router = express.Router();
var respon = require('../helper/Respon');
var mssql = require('../helper/Connect');

router.get('/getBookAppointment', async (req, res) => {
  try {
    let userId = req.query.userId ? req.query.userId : '';
    let search = req.query.search ? req.query.search : '';
    let treatment = req.query.treatment ? req.query.treatment : '';
    let status = req.query.status ? req.query.status : '';
    let startDate = req.query.startDate ? req.query.startDate : '';
    let endDate = req.query.endDate ? req.query.endDate : '';
    let openStartDate = req.query.openStartDate ? req.query.openStartDate : '';
    let openEndDate = req.query.openEndDate ? req.query.openEndDate : '';
    let pageSize = req.query.pageSize ? req.query.pageSize : 10;
    let currentPage = req.query.currentPage ? req.query.currentPage : 1;

    const query = `SELECT
    book.id,
    book.code,
    book.number,
    FORMAT(book.created_date,'yyyy-MM-dd') AS created_date,
    ops.open_date,
    ops.amount,
    ops.treatment_type_id,
    tre.treatment_type_name,
    u.id AS user_id,
    u.id_card,
    (pre.name + ' ' + u.name + ' ' + u.lastname) AS fullname,
    (pred.name + ' ' + doc.name + ' ' + doc.lastname) AS fullname_doctor,
    book.note,
    book.status,
    book.is_used
    FROM book_appointment AS book
    INNER JOIN open_schedule AS ops ON book.open_schedule_id = ops.id
    INNER JOIN treatment_type AS tre ON ops.treatment_type_id = tre.id
    INNER JOIN [user] AS u ON book.user_id = u.id
    INNER JOIN prefix AS pre ON u.prefix_id = pre.id
    INNER JOIN doctor AS doc ON ops.doctor_id = doc.id
    INNER JOIN prefix AS pred ON doc.prefix_id = pred.id`;

    await mssql.sql.query(query, function (err, response) {
      if (response) {
        if (response.recordset) {
          var query = response.recordset;

          if (userId) {
            query = query.filter((a) => a.user_id.toString() === userId.toString());
          }

          if (search) {
            query = query.filter((a) => a.fullname.includes(search) || a.fullname_doctor.includes(search) || a.code.includes(search));
          }

          if (treatment) {
            query = query.filter((a) => a.treatment_type_id.toString() === treatment.toString());
          }

          if (status) {
            query = query.filter((a) => a.status.toString() === status.toString());
          }

          if (openStartDate) {
            query = query.filter((a) => new Date(a.open_date) >= new Date(openStartDate));
          }

          if (openEndDate) {
            query = query.filter((a) => new Date(a.open_date) <= new Date(openEndDate));
          }

          if (startDate) {
            query = query.filter((a) => new Date(a.created_date) >= new Date(startDate));
          }

          if (endDate) {
            query = query.filter((a) => new Date(a.created_date) <= new Date(endDate));
          }

          res.send(respon.pagination(parseInt(pageSize), parseInt(currentPage), query));
        } else {
          res.status(500).send(respon.error());
        }
      } else {
        if (err) {
          res.status(500).send(respon.error());
          console.log(err);
        } else {
          res.status(500).send(respon.error());
        }
      }
    });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
