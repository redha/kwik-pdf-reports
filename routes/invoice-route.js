var express = require('express');
var router = express.Router();

const data = require('../data');
const pdfGenerator = require('../pdfgenerators/invoice');

router.get('/', (req, res) => {
    res.status(200).send(pdfGenerator.generateInvoice(data.invoiceData));
})

module.exports = router;