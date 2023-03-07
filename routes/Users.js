var express = require("express");
var router = express.Router();
var respon = require("../helper/Respon");
var mssql = require("../helper/Connect");

router.get("/getUsers", async (req, res) => {
  try {
    let search = req.query.search ? req.query.search : "";
    let pageSize = req.query.pageSize ? req.query.pageSize : 10;
    let currentPage = req.query.currentPage ? req.query.currentPage : 1;
    await mssql.sql.query(`SELECT 
      [user].id,
      [user].id_card,
      [user].password,
      [prefix].id AS prefix_id,
      [prefix].name AS prefix_name,
      [user].name,
      [user].lastname,
      CONCAT([prefix].name,' ',[user].name,' ',[user].lastname) AS fullname,
      [user].phone_number,
      [user].created_date,
      [user].is_used,
      [user].role
    FROM [user] 
    INNER JOIN prefix ON [user].prifix_id = [prefix].id
    WHERE [user].role = 0`, (err, response) => {
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

router.post("/register", async (req, res) => {
  try {
    const { id_card, password, prifix_id, name, lastname, birthday, phone_number, gender, address, subdistrict, district, province, postcode, prifix_contact_id, name_contact, lastname_contact, created_date, is_used, role } = req.body;
    const query = `INSERT INTO [Q_ONLINE].[dbo].[user] (id_card, password, prifix_id, name, lastname, birthday, phone_number, gender, address, subdistrict, district, province, postcode, prifix_contact_id, name_contact, lastname_contact, created_date, is_used, role)
     VALUES ('${id_card}','${password}','${prifix_id}','${name}','${lastname}','${birthday}','${phone_number}','${gender}','${address}','${subdistrict}','${district}','${province}','${postcode}','${prifix_contact_id}', '${name_contact}', '${lastname_contact}', GETDATE(), '${is_used}', '${role}')`;
    await mssql.sql.query(query, (err, data) => {
      if (data) {
        res.status(200).send(respon.success());
      } else {
        res.status(500).send(respon.error());
      }
    });
  } catch (error) {
    console.log(error);
  }
});

router.get("/login", async (req, res) => {
  try {
    const { id_card, password } = req.body;
    const query = `select id,id_card,name,lastname,role from [Q_ONLINE].[dbo].[user] where id_card = '${id_card}' and password = '${password}'`;
    await mssql.sql.query(query, (err, data) => {
      if (data) {
        res.status(200).send(respon.single(data.recordset));
      } else {
        res.status(500).send(respon.error());
      }
    });
  } catch (error) {
    console.log(error);
  }
});

router.put("/editUser/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { id_card, password, prifix_id, name, lastname, birthday, phone_number, gender, address, subdistrict, district, province, postcode, prifix_contact_id, name_contact, lastname_contact, is_used, role } = req.body;
    const query = `UPDATE [Q_ONLINE].[dbo].[user] 
        SET
        id_card = '${id_card}', 
        password = '${password}', 
        prifix_id = '${prifix_id}', 
        name = '${name}', 
        lastname = '${lastname}', 
        birthday = '${birthday}', 
        phone_number = '${phone_number}', 
        gender = '${gender}', 
        address = '${address}', 
        subdistrict = '${subdistrict}', 
        district = '${district}', 
        province = '${province}', 
        postcode = '${postcode}', 
        prifix_contact_id = '${prifix_contact_id}', 
        name_contact ='${name_contact}', 
        lastname_contact = '${lastname_contact}', 
        is_used = '${is_used}', 
        role = '${role}'
        WHERE id = '${id}' `;
    await mssql.sql.query(query, (err, data) => {
      console.log(data);
      if (data) {
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
