'use strict'
var express = require('express');
var router = express.Router();

const { invoicePDFGenerator } = require('../pdfgenerators/invoice');

router.post('/', (req, res) => {
    let result = invoicePDFGenerator.generateInvoice(req.body)
    if (result.error){
        res.status(400).send(result);
    }
    else{
        res.status(200).send(result);
    }
})

module.exports = router;