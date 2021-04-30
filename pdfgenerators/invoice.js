'use strict'

const fs = require ('fs');
var path = require('path');
const PDFDocument = require ('pdfkit');

let invoice = new PDFDocument ({size: 'A4'});
invoice.info = { Title: 'Invoice #1234', Author: 'You', CreationDate: new Date(), Producer: 'Kwik Gestion', Creator: 'Me', Keywords: 'invoice, 1234, kwik, You, Me'};

const marginLeft = 5;
let currentPositionY = marginLeft + 0;

const addHeader = function(doc){
    currentPositionY = 30;
    doc
    .fontSize(18)
    .text('Company Name Here', 30, currentPositionY)
    .fillColor('#ce4e00')
    .fontSize(10)
    .text('Rue du 29 Juillet 75 - N° 13 - MaVille 75200 - Algeria', 
        30, currentPositionY + 20 ,{ width: 100, ellipsis: false, lineBreak: true, height: 2})
    .fillColor('#595959')
    .text('email: email@server.com', 30, currentPositionY + 20 + 20, { width: 200 });

    currentPositionY += 20 + 20 + 20;
return doc;
}

const addLine = function(doc, line){
    doc.fontSize(10)
    .text(line.item, 30, currentPositionY, { width: 35})
    .text(line.description, 60, currentPositionY, { width: 200})
    .text(line.up, 280, currentPositionY, { align: 'right', width: 35})
    .text(line.qty, 315, currentPositionY, { align: 'right', width: 35})
    .text(line.discPercent, 370, currentPositionY, { align: 'right', width: 35})
    .text(line.amount, 420, currentPositionY, { align: 'right', width: 35})
    .text(line.vat, 500, currentPositionY, { align: 'right', width: 35});

    currentPositionY += 20;
}

function generateInvoice (invoiceData, res){
    
    let fileName = `invoice-${new Date().getTime()}.pdf`;

    try{
        console.log(`fileName is : ${fileName}`);
        path.join(__dirname, 'public')
        invoice.pipe(fs.createWriteStream(`./public/output/${fileName}`));
        console.log(`complete path is : "./public/output/${fileName}"`);

        addHeader(invoice);
        invoice.on('pageAdded', () => {
            addHeader(invoice);
        });

        invoiceData.content.forEach(invoiceLine => {
            addLine(invoice, invoiceLine)
        });

        invoice.end();
        return { result: true, message: `<a href="/output/${fileName}">/output/${fileName}</a>`};
    }
    catch(e){
        return { error : true, message: e.message};
    }
}

module.exports = { 
    generateInvoice 
};