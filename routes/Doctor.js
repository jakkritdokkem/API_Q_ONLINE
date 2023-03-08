var express = require('express');
var router = express.Router();
var multer = require('multer');
var mssql = require('../helper/Connect');
var respon = require('../helper/Respon');

var storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './uploads');
  },
  filename: function (req, file, callback) {
    callback(null, file.fieldname + '-' + Date.now() + '.png');
  },
});
var upload = multer({ storage: storage });

router.get('/getDoctor', async function (req, res) {
  try {
    console.log('req query', req.query);

    let search = req.query.search ? req.query.search : '';
    let treatment = req.query.treatment ? req.query.treatment : '';
    let status = req.query.status ? req.query.status : '';
    let pageSize = req.query.pageSize ? req.query.pageSize : 10;
    let currentPage = req.query.currentPage ? req.query.currentPage : 1;

    const query = `SELECT
    doc.id,
    doc.treatment_type_id,
    tre.treatment_type_name,
    doc.prefix_id,
    pre.name AS prefix_name,
    doc.name,
    doc.lastname,
    CONCAT(pre.name, ' ', doc.name, ' ', doc.lastname) AS fullname,
    doc.is_used
    FROM doctor AS doc
    LEFT JOIN treatment_type AS tre ON doc.treatment_type_id = tre.id
    LEFT JOIN prefix AS pre ON doc.prefix_id = pre.id`;

    await mssql.sql.query(query, function (err, response) {
      if (response) {
        if (response.recordset) {
          var query = response.recordset;

          if (search) {
            query = query.filter((a) => (a.prifix_name + ' ' + a.name + ' ' + a.lastname).includes(search));
          }

          if (treatment) {
            query = query.filter((a) => a.treatment_type_id.toString() === treatment.toString());
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

router.get('/getDetailDoctor/:id', async function (req, res) {
  try {
    mssql.sql.query(`SELECT * FROM doctor WHERE doctor.id = '${req.params.id}'`, function (err, response) {
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

router.get('/getDoctorBy/:id', async function (req, res) {
  try {
    const query = `SELECT
    doc.id,
    doc.treatment_type_id,
    tre.treatment_type_name,
    doc.prefix_id,
    pre.name AS prefix_name,
    doc.name,
    doc.lastname,
    CONCAT(pre.name, ' ', doc.name, ' ', doc.lastname) AS fullname,
    doc.is_used
    FROM doctor AS doc
    LEFT JOIN treatment_type AS tre ON doc.treatment_type_id = tre.id
    LEFT JOIN prefix AS pre ON doc.prefix_id = pre.id
    WHERE doc.is_used = '1'`;

    mssql.sql.query(query, function (err, response) {
      if (response) {
        if (response.recordset) {
          var query = response.recordset;

          if (parseInt(req.params.id) !== 0) {
            query = query.filter((a) => parseInt(a.treatment_type_id) === parseInt(req.params.id));
          }

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

router.post('/createDoctor', upload.single('image'), async function (req, res) {
  try {
    const { treatment, prefixId, name, lastname } = req.body;
    const image = req.file;

    const query = `INSERT INTO doctor
    (treatment_type_id, prefix_id, path_image, name, lastname, created_date, is_used)
    values('${treatment}', '${prefixId}', '${image.filename}', '${name}', '${lastname}', GETDATE(), 1)`;

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

router.put('/updateDoctor/:id', upload.single('image'), async function (req, res) {
  try {
    const { treatment, prefixId, name, lastname } = req.body;
    const image = req.file;

    console.log('req.file', req.file);
    console.log('req.body', req.body);
    console.log('req.params', req.params);

    const query = `UPDATE doctor
    SET
    treatment_type_id = '${treatment}' ,
    prefix_id = '${prefixId}'
    ${image ? `,path_image='${image.filename}',` : ','}
    name = '${name}',
    lastname = '${lastname}'
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

router.put('/updateStatusDoctor/:id', async function (req, res) {
  try {
    console.log('req params :', req.params);
    console.log('req body :', req.body);

    const query = `UPDATE doctor SET is_used = '${req.body.status}' WHERE id = '${req.params.id}'`;

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

router.delete('/deleteDoctor/:id', async function (req, res) {
  try {
    console.log('req params :', req.params);

    const query = `DELETE FROM doctor WHERE id = '${req.params.id}'`;

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

module.exports = router;
