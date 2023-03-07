var express = require("express");
var router = express.Router();
var respon = require("../helper/Respon");
var mssql = require("../helper/Connect");

router.get("/getOpenSchedule", async (req, res) => {
    try {
      let search = req.query.search ? req.query.search : "";
      let pageSize = req.query.pageSize ? req.query.pageSize : 10;
      let currentPage = req.query.currentPage ? req.query.currentPage : 1;
      await mssql.sql.query(`SELECT 
        [open_schedule].id,
        [open_schedule].open_date,
        [open_schedule].amount,
        [open_schedule].status,
        [open_schedule].is_used,
        [open_schedule].created_date,
        [doctor].name,
        [doctor].lastname,
        [prefix].name AS prefix_name,
        [treatment_type].treatment_type_name,
        CONCAT([prefix].name,' ',[doctor].name,' ',[doctor].lastname) AS fullname
      FROM [open_schedule]
      INNER JOIN [treatment_type] ON [open_schedule].treatment_type_id = [treatment_type].id
      INNER JOIN [doctor] ON [open_schedule].doctor_id = [doctor].id
      INNER JOIN [prefix] ON [doctor].prifix_id = [prefix].id`, (err, response) => {
        if (response) {
          if (response.recordset) {
            var query = response.recordset;
            if (search) {
              query = query.filter((a) => (a.prefix_name + a.name +' '+a.lastname).includes(search));
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

  router.get('/getDetailOpenSchedule/:id', async function (req, res) {
    try {
      console.log('req params :', req.params);
  
      await mssql.sql.query(`SELECT * FROM [open_schedule] WHERE id = '${req.params.id}'`, function (err, response) {
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
  
  router.post('/createOpenSchedule', async function (req, res) {
    try {
      console.log('req body :', req.body);
      await mssql.sql.query(
        `INSERT INTO [open_schedule] (treatment_type_id,open_date,doctor_id,amount,status, created_date, is_used)
         VALUES ('${req.body.treatment_type_id}','${req.body.open_date}','${req.body.doctor_id}','${req.body.amount}','${req.body.status}', GETDATE(), 1)`,
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
  
  router.put('/updateOpenSchedule/:id', async function (req, res) {
    try {
      console.log('req params :', req.params);
      console.log('req body :', req.body);
  
      await mssql.sql.query(`UPDATE [open_schedule] SET 
      treatment_type_id = '${treatment_type_id}',
      open_date = '${req.body.open_date}',
      doctor_id = '${req.body.doctor_id}',
      amount = '${req.body.amount}',
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
  
  router.put('/updateStatusOpenSchedule/:id', async function (req, res) {
    try {
      console.log('req params :', req.params);
      console.log('req body :', req.body);
  
      await mssql.sql.query(`UPDATE [open_schedule] SET is_used = '${req.body.status}' WHERE id = '${req.params.id}'`, function (err, response) {
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
  
  router.delete('/deleteOpenSchedule/:id', async function (req, res) {
    try {
      console.log('req params :', req.params);
  
      await mssql.sql.query(`DELETE FROM [open_schedule] WHERE id = '${req.params.id}'`, function (err, response) {
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