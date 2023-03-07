var express = require("express");
var router = express.Router();
var respon = require("../helper/Respon");
var mssql = require("../helper/Connect");

router.get("/getDoctors", async (req, res) => {
  try {
    let search = req.query.search ? req.query.search : "";
    let treatment_type = req.query.treatment_type_id ? req.query.treatment_type_id : "";
    let status = req.query.status ? req.query.status : "";
    let pageSize = req.query.pageSize ? req.query.pageSize : 10;
    let currentPage = req.query.currentPage ? req.query.currentPage : 1;
    const query = `select 
        doctor.id,
        CONCAT(prefix.name,' ',doctor.name ,' ', doctor.lastname) AS name,
        doctor.treatment_type_id,
        treatment_type.treatment_type_name
    FROM doctor
    inner join prefix on doctor.prifix_id = prefix.id
    inner join treatment_type on doctor.treatment_type_id = treatment_type.id`;

    await mssql.sql.query(query, function (err, response) {
      if (response) {
        if (response.recordset) {
          var query = response.recordset;
          if (search) {
            query = query.filter((a) => a.name.includes(search));
          }
          if (treatment_type) {
            query = query.filter((a) => a.treatment_type_id.includes(treatment_type));
          }
          if (status) {
            query = query.filter((a) => a.status.includes(status));
          }
          res.send(respon.pagination(parseInt(pageSize), parseInt(currentPage), query));
        } else {
          res.status(500).send(response.error());
        }
      } else {
        if (err) {
          res.status(500).send(response.error());
        }
      }
    });
  } catch (error) {
    console.log(error);
  }
});

router.get("/getDetailDoctor/:id", async (req, res) => {
  try {
    mssql.sql.query(
      `SELECT * FROM doctor WHERE doctor.id = '${req.params.id}'`,
      function (err, response) {
        if (response) {
          if (response.recordset) {
            var query = response.recordset;
            res.status(200).send(respon.single(query));
          } else {
            res.status(500).send(respon.error());
          }
        } else {
          if (err) {
            res.status(500).send(respon.error());
          } else {
            res.status(500).send(respon.error());
          }
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
});

router.post("/createDoctor", async (req, res) => {
  try {
    const { treatment_type_id, prifix_id, name, lastname, is_used } = req.body;
    await mssql.sql.query(`insert into doctor (treatment_type_id,prifix_id,name,lastname,created_date,is_used) values(${treatment_type_id},${prifix_id},'${name}','${lastname}',GETDATE(),${is_used})`, function (err, response) {
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

router.put("/editDoctor/:id", async (req, res) => {
  try {
    const { treatment_type_id, prifix_id, name, lastname, is_used } = req.body;
    await mssql.sql.query(
      `UPDATE doctor
    SET 
    treatment_type_id = '${treatment_type_id}' , 
    prifix_id = '${prifix_id}', 
    name = '${name}', 
    lastname = '${lastname}',
    is_used = '${is_used}'

    WHERE id = '${req.params.id}'`,
      (err, response) => {
        if (response) {
          res.status(200).send(respon.success());
        } else {
          res.status(500).send(respon.error());
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
});

router.delete("/deleteDoctor/:id", async (req, res) => {
  try {
    mssql.sql.query(`DELETE FROM [Q_ONLINE].[dbo].[doctor] WHERE id = '${req.params.id}'`, (err, response) => {
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
