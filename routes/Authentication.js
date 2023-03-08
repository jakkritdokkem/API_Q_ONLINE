var express = require('express');
var router = express.Router();
var respon = require('../helper/Respon');
var mssql = require('../helper/Connect');

router.post('/login', async (req, res) => {
  try {
    console.log('req.body', req.body);

    const { username, password } = req.body;

    const query = `SELECT id, id_card, CONCAT(name, ' ', lastname) AS fullname, role from [user] WHERE id_card = '${username}' AND password = '${password}' AND is_used = '1'`;

    await mssql.sql.query(query, (err, data) => {
      if (data) {
        let query = respon.single(data.recordset);
        if (query.data) {
          res.status(200).send(query);
        } else {
          res.status(200).send(respon.error(200, 'เลขบัตรประจำตัวประชาชน หรือรหัสผ่านไม่ถูกต้อง'));
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

module.exports = router;
