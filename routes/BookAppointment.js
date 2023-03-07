var express = require("express");
var router = express.Router();
var respon = require("../helper/Respon");
var mssql = require("../helper/Connect");

router.get("/getBookAppointment", async (req, res) => {
    try {
      let search = req.query.search ? req.query.search : "";
      let pageSize = req.query.pageSize ? req.query.pageSize : 10;
      let currentPage = req.query.currentPage ? req.query.currentPage : 1;
      await mssql.sql.query(`SELECT 
        [book_appointment].id,
        [book_appointment].code,
        [book_appointment].number,
        [book_appointment].note,
        [book_appointment].status,
        [book_appointment].is_used,
        [book_appointment].created_date,
        [open_schedule].amount,
        [user].id_card,
        [user].name,
        [user].lastname,
        [prefix].id AS prefix_id,
        [prefix].name AS prefix_name,
        CONCAT([prefix].name,' ',[user].name,' ',[user].lastname) AS fullname
      FROM [book_appointment]
      INNER JOIN [open_schedule] ON [book_appointment].open_schedule_id = [open_schedule].id
      INNER JOIN [user] ON [book_appointment].user_id = [user].id
      INNER JOIN [prefix] ON [user].prifix_id = [prefix].id`, (err, response) => {
        if (response) {
          if (response.recordset) {
            var query = response.recordset;
            if (search) {
              query = query.filter((a) => a.id_card.includes(search) || (a.prefix_name + a.name +' '+a.lastname).includes(search));
            }
            res.send(respon.pagination(parseInt(pageSize), parseInt(currentPage), query));
          } else {
              res.status(500).send(respon.error());
          }
        } else {
          if(err){
            res.status(500).send(respon.error());
            console.log(err)
          }
          else{
            res.status(500).send(respon.error());
          }
        }
      });
    } catch (error) {
      console.log(error);
    }
  });

  router.get('/getDetailBookAppointment/:id', async function (req, res) {
    try {
      console.log('req params :', req.params);
  
      await mssql.sql.query(`SELECT * FROM [book_appointment] WHERE id = '${req.params.id}'`, function (err, response) {
        if (response) {
          if (response.recordset) {
            var query = response.recordset;
            res.status(200).send(respon.single(query));
          } else {
            res.status(500).send(respon.error());
          }
        } else {
          res.status(500).send(respon.error());
        }
      });
    } catch (error) {
      console.log(error);
    }
  });
  
  router.post('/createBookAppointment', async function (req, res) {
    try {
      console.log('req body :', req.body);
      await mssql.sql.query(
        `INSERT INTO [book_appointment] (code,number,open_schedule_id,user_id,note,status, created_date, is_used)
         VALUES ('${req.body.code}','${req.body.number}','${req.body.open_schedule_id}','${req.body.user_id}','${req.body.note}','${req.body.status}', GETDATE(), 1)`,
        function (err, response) {
          if (response) {
            res.status(200).send(respon.success());
          } else {
            res.status(500).send(respon.error());
          }
        },
      );
    } catch (error) {
      console.log(error);
    }
  });
  
  router.put('/updateBookAppointment/:id', async function (req, res) {
    try {
      console.log('req params :', req.params);
      console.log('req body :', req.body);
  
      await mssql.sql.query(`UPDATE [book_appointment] SET 
      code = '${req.body.code}',
      number = '${req.body.number}',
      open_schedule_id = '${req.body.open_schedule_id}',
      user_id = '${req.body.user_id}',
      note = '${req.body.note}',
      status = '${req.body.status}'
      WHERE id = '${req.params.id}'`, function (err, response) {
        if (response) {
          res.status(200).send(respon.success());
        } else {
          res.status(500).send(respon.error());
        }
      });
    } catch (error) {
      console.log(error);
    }
  });
  
  router.put('/updateStatusBookAppointment/:id', async function (req, res) {
    try {
      console.log('req params :', req.params);
      console.log('req body :', req.body);
  
      await mssql.sql.query(`UPDATE [book_appointment] SET is_used = '${req.body.status}' WHERE id = '${req.params.id}'`, function (err, response) {
        if (response) {
          res.status(200).send(respon.success());
        } else {
          res.status(500).send(respon.error());
        }
      });
    } catch (error) {
      console.log(error);
    }
  });
  
  router.delete('/deleteBookAppointment/:id', async function (req, res) {
    try {
      console.log('req params :', req.params);
  
      await mssql.sql.query(`DELETE FROM [book_appointment] WHERE id = '${req.params.id}'`, function (err, response) {
        if (response) {
          res.status(200).send(respon.success());
        } else {
          res.status(500).send(respon.error());
        }
      });
    } catch (error) {
      console.log(error);
    }
  });

  module.exports = router;