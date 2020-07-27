const express = require('express')
const server = express()
const request = require('request')
var _req = request.defaults();
const fs = require('fs')
var base64 = require('base-64')
const uuid = require("uuid")
const cors = require('cors')
require('dotenv').config()

const { fetchData } = require("./functions")

server.use(express.json())
server.use(express.urlencoded({extended: true}))
server.use(cors())

server.get('/', (req, res) => {
    res.json({api:'Tecban'})
})

server.post('/credentials', (req, res) => {
     const basic_token = Buffer.from( process.env.clientID + ":" + process.env.clientSecret ).toString('base64')
    _req.post({
        uri : process.env.TokenEndpoint,
        key: fs.readFileSync('./certs/banco2/client_private_key.key'),
        cert: fs.readFileSync('./certs/banco2/client_certificate.crt'),
        headers: {
          'Content-Type' : 'application/x-www-form-urlencoded',
          'Accept' : 'application/x-www-form-urlencoded',
          'Authorization' : `Basic ${basic_token}`
        },
        rejectUnauthorized: false,
        form: { 
            'grant_type': 'client_credentials', 
            'scope': 'accounts openid'
        }
      }, function(error, response, body) {
        if(error)
            res.json(error);
        var _body = JSON.parse(body)
        var access_token = _body.access_token
        res.json({access_token, basic_token})
      }
    );
})

server.post('/consentiment', (req, res) => {
    _req.post({
       uri : process.env.ConsentimentEndpoint,
       ca: fs.readFileSync('./certs/banco1/chain.crt'),
       key: fs.readFileSync('./certs/banco1/client_private_key.key'),
       cert: fs.readFileSync('./certs/banco1/client_certificate.crt'),
       headers: {
         'Content-Type' : 'application/json',
         'Accept' : 'application/json',
         'x-fapi-financial-id': 'c3c937c4-ab71-427f-9b59-4099b7c680ab',
         'x-fapi-interaction-id': 'd3d75983-ee5e-423b-ab4f-d10be6be6ad1',
         'Authorization' : `Bearer ${req.body.token}`,
         'User-Agent': 'Mozilla/5.0'
       },
       rejectUnauthorized: false,
       json: req.body.data
     }, function(error, response, body) {
       if(error)
           res.json(error);
       res.json(body)
     }
   );  
})

server.get('/consentiment/view/:id', (req, res) => {
    _req.get({
       uri : `${process.env.ConsentimentEndpoint}/${req.params.id}`,
       ca: fs.readFileSync('./certs/banco1/chain.crt'),
       key: fs.readFileSync('./certs/banco1/client_private_key.key'),
       cert: fs.readFileSync('./certs/banco1/client_certificate.crt'),
       headers: {
         'Content-Type' : 'application/json',
         'Accept' : 'application/json',
         'x-fapi-financial-id': 'c3c937c4-ab71-427f-9b59-4099b7c680ab',
         'x-fapi-interaction-id': 'd3d75983-ee5e-423b-ab4f-d10be6be6ad1',
         'Authorization' : `Bearer ${req.query.token}`,
         'User-Agent': 'Mozilla/5.0'
       },
       rejectUnauthorized: false
     }, function(error, response, body) {
       if(error)
           res.json(error);
       res.json(body)
     }
   );
})

server.get('/redirect', (req, res) => {
    _req.get({
       uri : `${process.env.RedirEndpoint}/${req.query.consentId}?scope=accounts&alg=none`,
       ca: fs.readFileSync('./certs/banco1/chain.crt'),
       key: fs.readFileSync('./certs/banco1/client_private_key.key'),
       cert: fs.readFileSync('./certs/banco1/client_certificate.crt'),
       headers: {
         'Content-Type' : 'application/json',
         'Accept' : 'application/json',
         'x-fapi-financial-id': 'c3c937c4-ab71-427f-9b59-4099b7c680ab',
         'x-fapi-interaction-id': 'd3d75983-ee5e-423b-ab4f-d10be6be6ad1',
         'Authorization' : `Basic ${req.query.token}`,
         'User-Agent': 'Mozilla/5.0'
       },
       rejectUnauthorized: false
     }, function(error, response, body) {
       if(error)
           res.json(error);
       res.json(body)
     }
   );
})

// Obter o TOKEN pelo CÓDIGO de autorização gerado no login do banco do usuario
server.post('/generate-token', (req, res) => {
    const basic_token = Buffer.from( process.env.clientID + ":" + process.env.clientSecret ).toString('base64')

    _req.post({
       uri : `https://as1.tecban-sandbox.o3bank.co.uk/token`,
       ca: fs.readFileSync('./certs/banco1/chain.crt'),
       key: fs.readFileSync('./certs/banco1/client_private_key.key'),
       cert: fs.readFileSync('./certs/banco1/client_certificate.crt'),
       headers: {
         'Content-Type' : 'application/x-www-form-urlencoded',
         'Accept' : 'application/x-www-form-urlencoded',
         'x-fapi-financial-id': 'c3c937c4-ab71-427f-9b59-4099b7c680ab',
         'x-fapi-interaction-id': 'd3d75983-ee5e-423b-ab4f-d10be6be6ad1',
         'Authorization' : `Basic ${basic_token}`,
         'User-Agent': 'Mozilla/5.0'
       },
       rejectUnauthorized: false,
       form: {
        "code": req.body.data.code,
        "grant_type": "authorization_code",
        "redirect_uri": "http://www.google.co.uk",
        "scope": "accounts"
        }
     }, function(error, response, body) {
       if(error)
           res.json(error);
       res.json(body)
     }
   );  
})

server.get('/accounts', (req, res) => {
  fetchData('accounts', req.query.token, req, res)
})

server.get('/balances', (req, res) => {
  fetchData('balances', req.query.token, req, res)
})

server.get('/products', (req, res) => {
  fetchData('products', req.query.token, req, res)
})

server.get('/direct-debits', (req, res) => {
  fetchData('direct-debits', req.query.token, req, res)
})

server.get('/offers', (req, res) => {
  fetchData('offers', req.query.token, req, res)
})

server.del('/consentiment/:id', (req, res) => {
  _req.del({
     uri : `${process.env.ConsentimentEndpoint}/${req.params.id}`,
     ca: fs.readFileSync('./certs/banco1/chain.crt'),
     key: fs.readFileSync('./certs/banco1/client_private_key.key'),
     cert: fs.readFileSync('./certs/banco1/client_certificate.crt'),
     headers: {
       'Content-Type' : 'application/json',
       'Accept' : 'application/json',
       'x-fapi-financial-id': 'c3c937c4-ab71-427f-9b59-4099b7c680ab',
       'x-fapi-interaction-id': 'd3d75983-ee5e-423b-ab4f-d10be6be6ad1',
       'Authorization' : `Bearer ${req.query.token}`,
       'User-Agent': 'Mozilla/5.0'
     },
     rejectUnauthorized: false
   }, function(error, response, body) {
     if(error)
         res.json(error);
     res.json(body)
   }
 );  
})

server.listen(process.env.PORT, () => console.log(`Listening OpenBanking Tecban Hackathon! ...`))