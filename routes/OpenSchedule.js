var express = require('express');
var router = express.Router();
var respon = require('../helper/Respon');
var mssql = require('../helper/Connect');

router.get('/getOpenSchedule', async (req, res) => {
  try {
    let search = req.query.search ? req.query.search : '';
    let treatment = req.query.treatment ? req.query.treatment : '';
    let startDate = req.query.startDate ? req.query.startDate : '';
    let endDate = req.query.endDate ? req.query.endDate : '';
    let pageSize = req.query.pageSize ? req.query.pageSize : 10;
    let currentPage = req.query.currentPage ? req.query.currentPage : 1;

    const query = `SELECT
    O.id,
    O.open_date,
	  (SELECT COUNT(*) FROM book_appointment AS B WHERE B.open_schedule_id = O.id) AS book_amount,
    O.amount,
    O.status,
    O.is_used,
    O.created_date,
    P.name AS prefix_name,
    D.name,
    D.lastname,
    O.treatment_type_id,
    T.treatment_type_name,
    CONCAT(P.name, ' ', D.name, ' ', D.lastname) AS fullname
    FROM open_schedule AS O
    INNER JOIN treatment_type AS T ON O.treatment_type_id = T.id
    INNER JOIN doctor AS D ON O.doctor_id = D.id
    INNER JOIN prefix AS P ON D.prefix_id = P.id
    ORDER BY O.open_date DESC`;

    await mssql.sql.query(query, function (err, response) {
      if (response) {
        if (response.recordset) {
          var query = response.recordset;

          if (search) {
            query = query.filter((a) => (a.prefix_name + ' ' + a.name + ' ' + a.lastname).includes(search));
          }

          if (treatment) {
            query = query.filter((a) => a.treatment_type_id.toString() === treatment.toString());
          }

          if (startDate) {
            query = query.filter((a) => new Date(a.open_date) >= new Date(startDate));
          }

          if (endDate) {
            query = query.filter((a) => new Date(a.open_date) <= new Date(endDate));
          }

          res.status(200).send(respon.pagination(parseInt(pageSize), parseInt(currentPage), query));
        } else {
          res.status(500).send(respon.error());
        }
      } else {
        if (err) {
          res.status(500).send(respon.error(err.originalError.info.number, err.originalError.info.message));
        } else {
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

    await mssql.sql.query(`SELECT * FROM open_schedule WHERE id = '${req.params.id}'`, function (err, response) {
      if (response) {
        if (response.recordset) {
          var query = response.recordset;

          res.status(200).send(respon.single(query));
        } else {
          res.status(500).send(respon.error());
        }
      } else {
        if (err) {
          res.status(500).send(respon.error(err.originalError.info.number, err.originalError.info.message));
        } else {
          res.status(500).send(respon.error());
        }
      }
    });
  } catch (error) {
    console.log(error);
  }
});

router.get('/getOpenSchedulePublic', async (req, res) => {
  try {
    let search = req.query.search ? req.query.search : '';
    let treatment = req.query.treatment ? req.query.treatment : '';
    let startDate = req.query.startDate ? req.query.startDate : '';
    let endDate = req.query.endDate ? req.query.endDate : '';
    let pageSize = req.query.pageSize ? req.query.pageSize : 10;
    let currentPage = req.query.currentPage ? req.query.currentPage : 1;

    const query = `SELECT
    O.id,
    O.open_date,
	  (SELECT COUNT(*) FROM book_appointment AS B WHERE B.open_schedule_id = O.id) AS book_amount,
    O.amount,
    O.status,
    O.is_used,
    O.created_date,
    P.name AS prefix_name,
    D.name,
    D.lastname,
	  D.path_image,
    O.treatment_type_id,
    T.treatment_type_name,
    CONCAT(P.name, ' ', D.name, ' ', D.lastname) AS fullname
    FROM open_schedule AS O
    INNER JOIN treatment_type AS T ON O.treatment_type_id = T.id
    INNER JOIN doctor AS D ON O.doctor_id = D.id
    INNER JOIN prefix AS P ON D.prefix_id = P.id
	  WHERE o.is_used = '1' AND O.open_date >= FORMAT(GETDATE(), 'yyyy-MM-dd')
    ORDER BY O.open_date ASC`;

    await mssql.sql.query(query, function (err, response) {
      if (response) {
        if (response.recordset) {
          var query = response.recordset;

          if (search) {
            query = query.filter((a) => (a.prefix_name + ' ' + a.name + ' ' + a.lastname).includes(search));
          }

          if (treatment) {
            query = query.filter((a) => a.treatment_type_id.toString() === treatment.toString());
          }

          if (startDate) {
            query = query.filter((a) => new Date(a.open_date) >= new Date(startDate));
          }

          if (endDate) {
            query = query.filter((a) => new Date(a.open_date) <= new Date(endDate));
          }

          res.status(200).send(respon.pagination(parseInt(pageSize), parseInt(currentPage), query));
        } else {
          res.status(500).send(respon.error());
        }
      } else {
        if (err) {
          res.status(500).send(respon.error(err.originalError.info.number, err.originalError.info.message));
        } else {
          res.status(500).send(respon.error());
        }
      }
    });
  } catch (error) {
    console.log(error);
  }
});

router.post('/createOpenSchedule', async function (req, res) {
  try {
    console.log('req body :', req.body);

    const { treatment, doctor, openDate, amount } = req.body;

    const query = `INSERT INTO open_schedule
    (treatment_type_id, open_date, doctor_id, amount, status, created_date, is_used)
    VALUES ('${treatment}', '${openDate}', '${doctor}', '${amount}', '1', GETDATE(), 1)`;

    await mssql.sql.query(query, function (err, response) {
      if (response) {
        res.status(200).send(respon.success());
      } else {
        if (err) {
          res.status(500).send(respon.error(err.originalError.info.number, err.originalError.info.message));
        } else {
          res.status(500).send(respon.error());
        }
      }
    });
  } catch (error) {
    console.log(error);
  }
});

router.put('/updateOpenSchedule/:id', async function (req, res) {
  try {
    console.log('req params :', req.params);
    console.log('req body :', req.body);

    const { treatment, doctor, openDate, amount } = req.body;

    const query = `UPDATE open_schedule SET
    treatment_type_id = '${treatment}',
    open_date = '${openDate}',
    doctor_id = '${doctor}',
    amount = '${amount}'
    WHERE id = '${req.params.id}'`;

    await mssql.sql.query(query, function (err, response) {
      if (response) {
        res.status(200).send(respon.success());
      } else {
        if (err) {
          res.status(500).send(respon.error(err.originalError.info.number, err.originalError.info.message));
        } else {
          res.status(500).send(respon.error());
        }
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

    const { status } = req.body;

    await mssql.sql.query(`UPDATE open_schedule SET is_used = '${status}' WHERE id = '${req.params.id}'`, function (err, response) {
      if (response) {
        res.status(200).send(respon.success());
      } else {
        if (err) {
          res.status(500).send(respon.error(err.originalError.info.number, err.originalError.info.message));
        } else {
          res.status(500).send(respon.error());
        }
      }
    });
  } catch (error) {
    console.log(error);
  }
});

router.delete('/deleteOpenSchedule/:id', async function (req, res) {
  try {
    console.log('req params :', req.params);

    await mssql.sql.query(`DELETE FROM open_schedule WHERE id = '${req.params.id}'`, function (err, response) {
      if (response) {
        res.status(200).send(respon.success());
      } else {
        if (err) {
          res.status(500).send(respon.error(err.originalError.info.number, err.originalError.info.message));
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
