'use strict';
require('dotenv').config();
const express = require('express');
const agent = require('superagent');
const psql = require('pg');
const { urlencoded } = require('body-parser');
const { render } = require('ejs');
const server = express();
const client = new psql.Client(process.env.DATABASE_URL);
const PORT = process.env.PORT || 3030;

server.use(express.static('./public'));
server.use(urlencoded({extended:true}));
server.set('view engine','ejs');

server.get('/',getAllJokes);
function getAllJokes(req,res) {
    let url = 'https://official-joke-api.appspot.com/jokes/programming/ten';
    agent.get(url).then(apiResult=>{
        res.render('./index',{allJokes: apiResult.body})
    })
}
server.post('/addToFav',addToFav);
function addToFav(req,res) {
    let sql = 'insert into jokes(type,setup,punchline) values($1,$2,$3);';
    let values = [req.body.type,req.body.setup,req.body.punchline];
    client.query(sql,values).then(()=>{
        res.redirect('/');
    })
}
server.get('/myFav',myFav);
function myFav(req,res) {
let sql = 'select * from jokes;';
client.query(sql).then(dbResult=>{
    res.render('./fav-list',{allJokes: dbResult.rows})
})
}   
 server.post('/jokeDtl',jokeDtl);
 function jokeDtl(req,res) {
     let joke ={
         id : req.body.id,
         type : req.body.type,
         setup : req.body.setup,
         punchline : req.body.punchline,
     }
     res.render('./jokeDtl',{joke: joke});
 }

server.post('/update',updateJoke);
function updateJoke(req,res) {
    let sql = 'update jokes set type = $1, setup = $2, punchline = $3 where id = $4;';
    let values = [req.body.type,req.body.setup,req.body.punchline,req.body.id]
    client.query(sql,values).then(()=>{
        client.query(`select * from jokes where id = ${req.body.id};`).then(dbRsult=>{
            // res.redirect('/myFav')
            res.render('./jokeDtl',{joke: dbRsult.rows[0]});
        })
    })
}

server.post('/delete',deleteJoke);
function deleteJoke(req,res) {
    let sql = `delete from jokes where id = ${req.body.id};`;
    client.query(sql).then(()=>{
        // client.query(`select * from jokes where id = ${req.body.id};`).then(dbRsult=>{
            res.redirect('/myFav')
            // res.render('./jokeDtl',{joke: dbRsult.rows[0]});
        // })
    })
}

server.get('/random',getRandomJoke);
function getRandomJoke(req,res) {
    let url = 'https://official-joke-api.appspot.com/jokes/programming/random';
    agent.get(url).then(ranResult=>{
        let joke ={
            id : ranResult.body[0].id,
            type : ranResult.body[0].type,
            setup : ranResult.body[0].setup,
            punchline : ranResult.body[0].punchline,
        }
        console.log(joke);
        res.render('./randomJoke',{joke: joke})
    })
}

client.connect().then(()=>{
    server.listen(PORT,()=>{
        console.log('i am listining');
    })
})