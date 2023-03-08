var express = require('express');
var router = express.Router();
var respon = require('../helper/Respon');
var mssql = require('../helper/Connect');

router.get('/getUsers', async (req, res) => {
  try {
    let search = req.query.search ? req.query.search : '';
    let status = req.query.status ? req.query.status : '';
    let pageSize = req.query.pageSize ? req.query.pageSize : 10;
    let currentPage = req.query.currentPage ? req.query.currentPage : 1;

    const query = `SELECT
    [user].id,
    [user].id_card,
    [user].password,
    [prefix].id AS prefix_id,
    [prefix].name AS prefix_name,
    [user].name,
    [user].lastname,
    CONCAT([prefix].name,[user].name,' ',[user].lastname) AS fullname,
    [user].address,
    [user].subdistrict,
    [user].district,
    [user].province,
    [user].postcode,
    [user].phone_number,
    [user].created_date,
    [user].is_used,
    [user].role
    FROM [user]
    INNER JOIN prefix ON [user].prefix_id = [prefix].id
    WHERE [user].role = 0`;

    await mssql.sql.query(query, function (err, response) {
      if (response) {
        if (response.recordset) {
          var query = response.recordset;
          if (search) {
            query = query.filter((a) => a.id_card.includes(search) || (a.prefix_name + a.name + ' ' + a.lastname).includes(search));
          }

          if (status) {
            query = query.filter((a) => a.is_used.toString() === status.toString());
          }

          res.send(respon.pagination(parseInt(pageSize), parseInt(currentPage), query));
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

router.get('/getDetailUser/:id', async function (req, res) {
  try {
    console.log('req params :', req.params);
    await mssql.sql.query(`SELECT * FROM [user] WHERE id = '${req.params.id}'`, function (err, response) {
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

// router.post('/register', async (req, res) => {
//   try {
//     const query = `INSERT INTO [user] (id_card, password, prefix_id, name, lastname, birthday, phone_number, gender, address, subdistrict, district, province, postcode, prifix_contact_id, name_contact, lastname_contact, created_date, is_used, role)
//     VALUES ('${req.body.id_card}','${req.body.password}','${req.body.prefix_id}','${req.body.name}','${req.body.lastname}','${req.body.birthday}','${req.body.phone_number}','${req.body.gender}','${req.body.address}','${req.body.subdistrict}','${req.body.district}','${req.body.province}','${req.body.postcode}','${req.body.prifix_contact_id}', '${req.body.name_contact}', '${req.body.lastname_contact}', GETDATE(),1,0)`;
//     await mssql.sql.query(query, (err, response) => {
//       if (response) {
//         res.status(200).send(respon.success());
//       } else {
//         if (err) {
//           res.status(500).send(respon.error(err.originalError.info.number, err.originalError.info.message));
//         } else {
//           res.status(500).send(respon.error());
//         }
//       }
//     });
//   } catch (error) {
//     console.log(error);
//   }
// });

router.post('/createUser', async (req, res) => {
  try {
    console.log(req.body);
    const query = `INSERT INTO [user] (id_card, password, prefix_id, name, lastname, birthday, phone_number, gender, address, subdistrict, district, province, postcode, prifix_contact_id, name_contact, lastname_contact, created_date,is_used,role)
     VALUES ('${req.body.idCard}','${req.body.password}','${req.body.prefixId}','${req.body.name}','${req.body.lastname}','${req.body.birthday}','${req.body.phoneNumber}','${req.body.gender}','${req.body.address}','${req.body.subdistrict}','${req.body.district}','${req.body.province}','${req.body.postcode}','${req.body.prifixContactId}', '${req.body.nameContact}', '${req.body.lastnameContact}', GETDATE(),1,0)`;
    await mssql.sql.query(query, (err, response) => {
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

// router.get('/login', async (req, res) => {
//   try {
//     const { id_card, password } = req.body;
//     const query = `select id,id_card,name,lastname,role from [Q_ONLINE].[dbo].[user] where id_card = '${id_card}' and password = '${password}'`;
//     await mssql.sql.query(query, (err, data) => {
//       if (data) {
//         res.status(200).send(respon.single(data.recordset));
//       } else {
//         if (err) {
//           res.status(500).send(respon.error(err.originalError.info.number, err.originalError.info.message));
//         } else {
//           res.status(500).send(respon.error());
//         }
//       }
//     });
//   } catch (error) {
//     console.log(error);
//   }
// });

router.put('/updateUser/:id', async (req, res) => {
  try {
    const query = `UPDATE [Q_ONLINE].[dbo].[user]
        SET
        id_card = '${req.body.idCard}',
        password = '${req.body.password}',
        prefix_id = '${req.body.prefixId}',
        name = '${req.body.name}',
        lastname = '${req.body.lastname}',
        birthday = '${req.body.birthday}',
        phone_number = '${req.body.phoneNumber}',
        gender = '${req.body.gender}',
        address = '${req.body.address}',
        subdistrict = '${req.body.subdistrict}',
        district = '${req.body.district}',
        province = '${req.body.province}',
        postcode = '${req.body.postcode}',
        prifix_contact_id = '${req.body.prifixContactId}',
        name_contact ='${req.body.nameContact}',
        lastname_contact = '${req.body.lastnameContact}'
        WHERE id = '${req.params.id}' `;

    await mssql.sql.query(query, (err, response) => {
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

router.put('/updateStatusUser/:id', async function (req, res) {
  try {
    console.log('req params :', req.params);
    console.log('req body :', req.body);

    await mssql.sql.query(
      `UPDATE [user] SET is_used = '${req.body.status}'
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

router.delete('/deleteUser/:id', async function (req, res) {
  try {
    console.log('req params :', req.params);
    await mssql.sql.query(`DELETE FROM [user] WHERE id = '${req.params.id}'`, function (err, response) {
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
