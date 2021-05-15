'use strict'
var express = require('express');
var router = express.Router();

const data = require('../data');
const { invoicePDFGenerator } = require('../pdfgenerators/invoice');

router.get('/', (req, res) => {
    let result = invoicePDFGenerator.generateInvoice(data.invoiceData, res)
    if (result.error){
        res.status(400).send(result);
    }
    else{
        res.status(200).send(result);
    }
})

module.exports = router;