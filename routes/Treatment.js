var express = require('express');
var router = express.Router();
var mssql = require('../helper/Connect');
var respon = require('../helper/Respon');

router.get('/getTreatment', async function (req, res) {
  try {
    console.log('req query', req.query);

    let search = req.query.search ? req.query.search : '';
    let status = req.query.status ? req.query.status : '';
    let pageSize = req.query.pageSize ? req.query.pageSize : 10;
    let currentPage = req.query.currentPage ? req.query.currentPage : 1;

    await mssql.sql.query(`SELECT * FROM treatment_type`, function (err, response) {
      if (response) {
        if (response.recordset) {
          var query = response.recordset;

          if (search) {
            query = query.filter((a) => a.treatment_type_name.includes(search));
          }

          if (status) {
            query = query.filter((a) => a.is_used.toString() === status.toString());
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

router.get('/getDetailTreatment/:id', async function (req, res) {
  try {
    console.log('req params :', req.params);

    await mssql.sql.query(`SELECT id, treatment_type_name AS name FROM treatment_type WHERE id = '${req.params.id}'`, function (err, response) {
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

router.get('/getTreatmentAll', async function (req, res) {
  try {

    await mssql.sql.query(`SELECT id, treatment_type_name AS name FROM treatment_type WHERE is_used = '1'`, function (err, response) {
      if (response) {
        if (response.recordset) {
          var query = response.recordset;

          res.status(200).send(respon.multi(query));
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

router.post('/createTreatment', async function (req, res) {
  try {
    console.log('req body :', req.body);

    await mssql.sql.query(
      `INSERT INTO treatment_type (treatment_type_name, created_date, is_used)
       VALUES ('${req.body.name}', GETDATE(), 1)`,
      function (err, response) {
        if (response) {
          res.status(200).send(respon.success());
        } else {
          if (err) {
            res.status(500).send(respon.error(err.originalError.info.number, err.originalError.info.message));
          } else {
            res.status(500).send(respon.error());
          }
        }
      },
    );
  } catch (error) {
    console.log(error);
  }
});

router.put('/updateTreatment/:id', async function (req, res) {
  try {
    console.log('req params :', req.params);
    console.log('req body :', req.body);

    await mssql.sql.query(
      `UPDATE treatment_type SET treatment_type_name = '${req.body.name}'
       WHERE id = '${req.params.id}' `,
      function (err, response) {
        if (response) {
          res.status(200).send(respon.success());
        } else {
          if (err) {
            res.status(500).send(respon.error(err.originalError.info.number, err.originalError.info.message));
          } else {
            res.status(500).send(respon.error());
          }
        }
      },
    );
  } catch (error) {
    console.log(error);
  }
});

router.put('/updateStatusTreatment/:id', async function (req, res) {
  try {
    console.log('req params :', req.params);
    console.log('req body :', req.body);

    await mssql.sql.query(
      `UPDATE treatment_type SET is_used = '${req.body.status}'
       WHERE id = '${req.params.id}'`,
      function (err, response) {
        if (response) {
          res.status(200).send(respon.success());
        } else {
          if (err) {
            res.status(500).send(respon.error(err.originalError.info.number, err.originalError.info.message));
          } else {
            res.status(500).send(respon.error());
          }
        }
      },
    );
  } catch (error) {
    console.log(error);
  }
});

router.delete('/deleteTreatment/:id', async function (req, res) {
  try {
    console.log('req params :', req.params);

    await mssql.sql.query(
      `DELETE FROM treatment_type
       WHERE id = '${req.params.id}'`,
      function (err, response) {
        if (response) {
          res.status(200).send(respon.success());
        } else {
          if (err) {
            res.status(500).send(respon.error(err.originalError.info.number, err.originalError.info.message));
          } else {
            res.status(500).send(respon.error());
          }
        }
      },
    );
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
