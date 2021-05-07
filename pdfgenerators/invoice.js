'use strict'

const fs = require ('fs');
const PDFDocument = require ('pdfkit');

let data = null;

const SIZE = 'A4';
const MAXX = 595;
const MAXY = 841;
const MARGIN_LEFT = 25;
const MARGIN_RIGHT = 25;
const MARGIN_TOP = 15;
const MARGIN_BOTTOM = 15;
const ROW_SPACING = 6;
const BODY_FONT_SIZE = 9;
const FOOTER_FONT_SIZE = 7;

let currentPositionY = MARGIN_TOP;
let pageNumber = 1;
let pageFooterHeight = 50;
let reportFooterHeight = 150;
let pageHeaderHeight = 0;
let reportHeaderHeight = 0;

let invoice = new PDFDocument ({size: SIZE, margins: { top: MARGIN_TOP, right: MARGIN_RIGHT, left: MARGIN_LEFT, bottom: MARGIN_BOTTOM }});
invoice.font('Helvetica').lineGap(3);
invoice.info = { Title: 'Invoice #1234', displayTitle: true, Author: 'You', CreationDate: new Date(), Producer: 'Kwik Gestion', Creator: 'Me', Keywords: 'invoice, 1234, kwik, You, Me'};

const generatePageHeader = function(){
  invoice.image('images/logo.png',MAXX - MARGIN_RIGHT - 140, MARGIN_TOP, {width: 140, height: 70})
  currentPositionY = 15;
  let stepY = 13;

  invoice
  .font(`Helvetica-Bold`)
  .fontSize(2*BODY_FONT_SIZE)
  .text(data.companyName, MARGIN_LEFT, currentPositionY)
  .font(`Helvetica`)
  .fontSize(1.5*BODY_FONT_SIZE)
  .text(data.companyActivity, MARGIN_LEFT, currentPositionY + 1.7*stepY)
  .fontSize(BODY_FONT_SIZE)
  .text(`Capital Social: ${data.companyCapital}`, MARGIN_LEFT, currentPositionY + 3*stepY)
  .text(`Adresse: ${data.companyAddress}`, MARGIN_LEFT, currentPositionY + 4*stepY)
  .text(`Tél.: ${data.companyPhone} - Email: ${data.companyEmail}`, MARGIN_LEFT, currentPositionY + 5*stepY)

  currentPositionY += Math.max(currentPositionY + 5*stepY, 50) ;

  invoice.lineWidth(1)
  .moveTo(MARGIN_LEFT, currentPositionY)
  .lineTo(MAXX - MARGIN_RIGHT, currentPositionY)
  .stroke();

  currentPositionY += 13;

}

const generateReportHeader = function(){
  invoice
  .font(`Helvetica-Bold`)
  .fontSize(15)
  .text(`REPORT HEADER HERE...`, MARGIN_LEFT + 5, currentPositionY, { width: MAXX, align: 'center' }),
  currentPositionY += invoice.heightOfString(`REPORT HEADER HERE...`, MARGIN_LEFT, currentPositionY, { width: MAXX, align: 'center' })
   + 20;
}

const generateDetailsHeader = function(){
  invoice.font('Helvetica-Bold');
  generateDetail({ line: '#', item: "Code", description: "Description", up: "PU", qty: "Qté", vat: "TVA%", discPercent: "Rem%", amount: "Montant" });
  invoice.font('Helvetica');
}

const generateDetail = function(line){

  if (currentPositionY + MARGIN_BOTTOM + 120 > MAXY) invoice.addPage();

  let textOptions = { lineBreak: true, ellipsis: true };
  let numberOptions = { lineBreak: true, ellipsis: true, align: "right" };

  invoice.fontSize(9)
  .text(line.item, MARGIN_LEFT + 5, currentPositionY, { width: 35, ...textOptions })
  .text(line.description, 70, currentPositionY, { width: 200, ...textOptions })
  .text(line.up, 275, currentPositionY, { width: 65, ...numberOptions })
  .text(line.qty, 345, currentPositionY, { width: 65, ...numberOptions})
  .text(line.discPercent, 410, currentPositionY, { width: 35, ...numberOptions })
  .text(line.amount, 445, currentPositionY, { width: 65, ...numberOptions })
  .text(line.vat, 510, currentPositionY, { width: 35, ...numberOptions });

  let itemHeight = invoice.heightOfString(line.item, { width: 35, ...textOptions });
  let descHeight = invoice.heightOfString(line.description, { width: 200, ...textOptions });

  currentPositionY += Math.max(itemHeight, descHeight) + ROW_SPACING;

  invoice.moveTo(MARGIN_LEFT, currentPositionY - 7)
    .lineTo(MAXX - MARGIN_RIGHT, currentPositionY - 7)
    .stroke();
}

const generateReportFooter = function(){
  invoice
  .font(`Helvetica-Bold`)
  .fontSize(15)
  .text(`...REPORT FOOTER HERE...`, MARGIN_LEFT, MAXY - MARGIN_BOTTOM - pageFooterHeight - reportFooterHeight , { width: MAXX, align: 'center'}),
  currentPositionY += invoice.heightOfString(`...REPORT FOOTER HERE...`, MARGIN_LEFT, currentPositionY, { width: MAXX, align: 'center'}) + 10;
}

const generatePageFooter = function(){
  invoice.lineWidth(0.3).fontSize(FOOTER_FONT_SIZE);

  let line0 = `Page ${pageNumber} `;  
  let line1 = data.companyName;
  let line2 = `Adresse: ${data.companyAddress} `;
  let line3 = `RC: ${data.companyRC} - IF: ${data.companyIF} - NIS: ${data.companyNIS} - AI: ${data.companyAI} - Tél: ${data.companyPhone} - Email:${data.companyEmail} `;

  invoice.fontSize(FOOTER_FONT_SIZE);
  let h0 = invoice.heightOfString(line0, MARGIN_RIGHT, MARGIN_TOP, { align: "center", width: MAXX - MARGIN_LEFT - MARGIN_RIGHT });
  invoice.font('Helvetica-Bold').fontSize(FOOTER_FONT_SIZE);
  let h1 = invoice.heightOfString(line1, MARGIN_RIGHT, MARGIN_TOP, { align: "center", width: MAXX - MARGIN_LEFT - MARGIN_RIGHT }) 
  invoice.font('Helvetica').fontSize(FOOTER_FONT_SIZE);
  let h2 = invoice.heightOfString(line2, MARGIN_RIGHT, MARGIN_TOP, { align: "center", width: MAXX - MARGIN_LEFT - MARGIN_RIGHT })
  let h3 = invoice.heightOfString(line3, MARGIN_RIGHT, MARGIN_TOP, { align: "center", width: MAXX - MARGIN_LEFT - MARGIN_RIGHT });
  
  let y = MAXY - MARGIN_BOTTOM - (h0 + h1 + h2 + h3);

  invoice.fontSize(FOOTER_FONT_SIZE);
  invoice.text(line0, MARGIN_RIGHT, y, { align: "center", width: MAXX - MARGIN_LEFT - MARGIN_RIGHT });
  y += h0;
  invoice
  .moveTo(MARGIN_LEFT, y - 0.3*h0)
  .lineTo(MAXX - MARGIN_RIGHT, y - 0.4*h0)
  .stroke();

  invoice
  .font('Helvetica-Bold')
  .fontSize(BODY_FONT_SIZE)
  .text(line1, MARGIN_RIGHT, y, { align: "center", width: MAXX - MARGIN_LEFT - MARGIN_RIGHT })
  .font('Helvetica');
  y += h1;
  invoice.fontSize(FOOTER_FONT_SIZE);
  invoice.text(line2, MARGIN_RIGHT, y, { align: "center", width: MAXX - MARGIN_LEFT - MARGIN_RIGHT });
  y += h2;
  invoice.text(line3, MARGIN_RIGHT, y, { align: "center", width: MAXX - MARGIN_LEFT - MARGIN_RIGHT });
  y += h3;
  invoice.fontSize(BODY_FONT_SIZE);
}

const generateInvoice = function (invoiceData, res, resType = 'link'){
  data = invoiceData;
  if (resType == 'link'){
    let fileName = `invoice-${new Date().getTime()}.pdf`;
    try{
      console.log(`fileName is : http://localhost:3000/output/${fileName}`);
      invoice.pipe(fs.createWriteStream(`./public/output/${fileName}`));
  
      generatePageHeader();
      generateReportHeader();
      generatePageFooter();
      generateDetailsHeader()

      invoice.on('pageAdded', () => {
        pageNumber++;
        generatePageHeader();
        generateReportHeader();
        generatePageFooter();
        generateDetailsHeader()
      });

      data.content.forEach(invoiceLine => {
        generateDetail(invoiceLine)
      });
      generateReportFooter(invoice)
      invoice.end();
      return { error: false, message: `http://localhost:3000/output/${fileName}`};
    }
    catch(e){
      return { error: true, message: e.message};
    }
  }
  else{
    return { error: true, message: `The method ${resType} isn't Implemented Yet !`}
  }
}

module.exports = { 
  generateInvoice 
};