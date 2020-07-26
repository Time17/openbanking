const request = require('request')
const fs = require('fs')

function fetchData(resource, token, req, res) {
    request.get({
        uri : `${process.env.MainEndpoint}/${resource}`,
        ca: fs.readFileSync('./certs/banco1/chain.crt'),
        key: fs.readFileSync('./certs/banco1/client_private_key.key'),
        cert: fs.readFileSync('./certs/banco1/client_certificate.crt'),
        headers: {
            'Content-Type' : 'application/json',
            'Accept' : 'application/json',
            'x-fapi-financial-id': 'c3c937c4-ab71-427f-9b59-4099b7c680ab',
            'x-fapi-interaction-id': 'd3d75983-ee5e-423b-ab4f-d10be6be6ad1',
            'Authorization' : `Bearer ${token}`,
            'User-Agent': 'Mozilla/5.0'
        },
        rejectUnauthorized: false
        }, function(error, response, body) {
        if(error)
            res.json(error);
        res.json(JSON.parse(body))
        }
    );
}

module.exports = { fetchData }