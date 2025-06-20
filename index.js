const express = require("express");
const app = express();
const path = require("path");
const port = 8080;
const methodOverride = require("method-override")
const {faker} = require('@faker-js/faker');
const mysql = require('mysql2');
const { v4: uuidv4 } = require('uuid');

app.use(methodOverride("_method"));
app.use(express.urlencoded({extended: true}));

app.set("view engine","ejs");
app.set("view engine", path.join(__dirname,"/views"));

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'delta_app',
  password: 'Uzair@1234',
});

let getRandomUser = ()=> {
  return [
   faker.string.uuid(),
   faker.internet.username(), // before version 9.1.0, use userName()
   faker.internet.email(),
   faker.internet.password(),
];
}

//HOME PAGE for home.ejs Welcome
app.get("/", (req,res) => {           
  let q = "SELECT COUNT(*) FROM user";
    try{
      connection.query(q, (err, result) => {
        if(err) throw err;
        console.log(result[0])
        let count = result[0]["COUNT(*)"];
        res.render("home.ejs",{ count });
      });
  } catch(err){
    console.log(err)
    res.send("Some error occured");
  }

});


//SHOWING TABLE OF ALL USERS from DATABASE BY RUNNING BELOW QUERY
app.get("/users", (req,res) => {
  let q = "SELECT * FROM user"
  try{
    connection.query(q, (err, result) =>{{
      if(err)throw err;
      let users = result;
      res.render("users.ejs",{users})
      
    }})

  }catch(err){
    console.log(err)
    res.send("some error occured at DB side")
  }
})


//DISPLAYING INFORMATION FOR EDITING AND GIVING THEM A FORM 
app.get("/users/:id/edit", (req,res) =>{
  let {id} = req.params
  let q = `SELECT * FROM user WHERE id = '${id}'`
  try{
    connection.query(q, (err, result) =>{
      if(err) throw err;
      let user = result[0];
      res.render("edit.ejs",{user});
      
    })
  }catch(err){
    console.log(err)
    res.send("some error occured")
  }
})

//UPDATING Database information according to edit.ejs form filled data
app.patch("/users/:id", (req, res) => {
  let {id} = req.params
  let {password: formPass , username: newUsername}=req.body
  
  q = `SELECT * FROM user WHERE id = '${id}'`
  try{
    connection.query(q, (err, result) => {
      if(err)throw err;
      let user = result[0]
       if (formPass != user.password){
      res.send("WRONG PASSWORD")
      }else{
        q2 = `UPDATE user SET username = '${newUsername}' WHERE id = '${id}'`
        try{
          connection.query(q2, (err, result) => {
            if(err) throw err;
            res.redirect("/users")
          })
        }catch(err){
          console.log(err)
          res.send("Some error occured while updating username")
        }
      }
    })
  }catch(err){
    console.log(err);
    res.send("some error occured")
  }
  

})
app.get("/users/new", (req, res) => {   // 1    Taking new user by help of form
  res.render("add.ejs")
})

app.post("/users", (req, res) => {   // 2     Now adding it to DB
  let {username, email, password} = req.body
  let id = uuidv4(); 
  let q = `INSERT INTO user(id, username, email, password) VALUES (?, ?, ?, ?) `
  let inp = [id, username, email, password]
  try{
    connection.query(q, inp, (err, result) => {
      if(err) throw err;
      console.log(result)
      res.redirect("/users")
    })
  }catch(err){
    console.log(err)
    res.send("error occured")
  }
})

app.delete("/users/:id", (req, res) => {      // "DELETING' user from DB
  let {id} = req.params;
  let q = `DELETE FROM user WHERE id = '${id}';`
  try{
    connection.query(q,(err, result) => {
      if(err)throw err;
      console.log(result);
      res.redirect("/users")
    })
  }catch(err){
    console.log(err)
    res.send("Some error occured while deleting the specified user")
  }
})

app.listen(port, () => {
  console.log("We are listening speakout")
});


//let q = "INSERT INTO user (id,username,email,password) VALUES ?";
// let data = [];

// for(i=1; i<=100 ; i++){
//   data.push(getRandomUser());
// }

// try{
//     connection.query(q,[data], (err, result) => {
//       if(err) throw err;
//         console.log(result);
//     });
// } catch(err){
//     console.log(err);
// }

// connection.end();
