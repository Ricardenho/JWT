const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken")

const JWTSecret = "opa"//senha de criptação do jwt

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

function auth(req, res, next){

    const authToken = req.headers['authorization']
    
    if( authToken != undefined){

        const bearer = authToken.split(' ');
        const token = bearer[1];
        jwt.verify(token, JWTSecret, (err, data) => {
            if(err){
                res.status(401)
                res.json({err:"Token Invalido"})
            }
            else{
                req.token= token
                req.loggedUser = {id: data.id, email:data.email}
                next();
            }
        })

    }else{
        res.status(401);
        res.json({err: "Token Invalido"})
    }
    next();

}

var DB = {
    games:[
        { id:23, title:"Call of Duty MW", year:2019, price:60 },
        { id:65, title:"Sea of Thieves", year:2018, price:64 },
        { id:02, title:"Minecraft", year:2012, price:20 },
    ],
    users:[
        {id: 1, name:"Roberto Carlos", email:"roberto@gmail.com", password:"roberto123"},
        {id: 2, name:"Sofia Perz", email:"sofia@gmail.com", password:"sofia123"}
    ]
}

app.get("/games", auth, (req,res) =>{

    res.status (200);
    res.json({  token:req.token,//podemos enviar o tokenno json para validação no front-end
                data:req.loggedUser,//podemos enviar dados do data
                games:DB.games // e as infos do Banco de Dados
            });
});

app.get("/games/:id", auth, (req, res) =>{
    if(isNaN(req.params.id)){
        res.status(400);
    }else{
        var id = parseInt(req.params.id);
        var game = DB.games.find(g => g.id == id);

        if (game!= undefined){
            res.status (200);
            res.json(game)
        }else{
            res.status(404)
        }
    }
})

app.post("/game", (req, res) => {
    var {title, price, year} = req.body;

    DB.games.push({id:2323, title, price, year});

    res.status (200);
})

app.delete("/game/:id", (req, res) =>{
    if(isNaN(req.params.id)){
        res.status(400);
    }else{
        var id = parseInt(req.params.id);
        DB.games.splice(DB.games.indexOf(id), 1)
        res.status(200)
    }
})

app.put("/game/:id", (req, res) => {
    var id = parseInt(req.params.id);
    var {title, price, year} = req.body;
    for(var i=0; i< DB.games.length;i++){
        if (DB.games[i].id===id){
            if(title != undefined){
                DB.games[i].title = title
            }
            if(price != undefined){
                DB.games[i].price = price
            }
            if(year != undefined){
                DB.games[i].year = year
            }
        }
    }

    res.status (200);
})

app.post("/auth", (req, res) => {
    var {email, password} = req.body
    if(email != undefined){
        var user = DB.users.find(u => u.email == email);
        if (user.email == email){
            if(user.password == password){
                jwt.sign({id:user.id, email:user.email}, JWTSecret,{expiresIn: "48h"}, (err, token) => {
                    if(err){
                        res.status(400)
                        res.json({err:"Falha Interna"})
                    }else{
                        res.status(200);
                        res.json({Token: token})
                    }
                })
                
            }else{
                res.status(401);
                res.json({err: "Credenciais Invalidas"})
            }
        }
        else{
            res.status (400);
            res.json({ err: "O E-mail enviado não existe na base de dados!"})
        }
    }

    else{
        res.status (400);
        res.json({err: "O E-mail é invalido"})
    }
})



app.listen(45678, () => {
    console.log("API Rodando")
})