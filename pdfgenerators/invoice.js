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
const ROW_SPACING = 2*4;
const bodyFontSize = 9;
const footerFontSize = 7;

let currentPositionY = MARGIN_TOP;
let pageNumber = 1;
let pageFooterHeight = 0;
let reportFooterHeight = 0;
let pageHeaderHeight = 0;
let reportHeaderHeight = 0;

let invoice = new PDFDocument ({size: SIZE, margins: { top: MARGIN_TOP, right: MARGIN_RIGHT, left: MARGIN_LEFT, bottom: MARGIN_BOTTOM }});
invoice.info = { Title: 'Invoice #1234', displayTitle: true, Author: 'You', CreationDate: new Date(), Producer: 'Kwik Gestion', Creator: 'Me', Keywords: 'invoice, 1234, kwik, You, Me'};

const generatePageHeader = function(){
  currentPositionY = MARGIN_TOP;
  invoice.lineWidth(30).fillColor("#555");
  invoice
  .fontSize(18)
  .text('Company Name Here', 30, currentPositionY)
  .fillColor('#ce4e00')
  .fontSize(10)
  .text('Rue du 5 Juillet 85 - N° 13 - MaVille 75200 - Algeria', currentPositionY)
  .fillColor('#595959')
  .text('email: email@server.com', 30, currentPositionY + 20 + 20, { width: 200 });

  currentPositionY += 20 + 20 + 20;
}

const generatePageFooter = function(){
  invoice.lineWidth(0.3).fillColor("#555").fontSize(footerFontSize).lineGap(3);

  let line0 = `Page ${pageNumber} `;  
  let line1 = data.companyName;
  let line2 = `Adresse: ${data.companyAddress} `;
  let line3 = `RC: ${data.companyRC} - IF: ${data.companyIF} - NIS: ${data.companyNIS} - AI: ${data.companyAI} - Tél: ${data.companyPhone} - Email:${data.companyEmail} `;
  invoice.fontSize(footerFontSize);
  let h0 = invoice.heightOfString(line0, MARGIN_RIGHT, MARGIN_TOP, { align: "center", width: MAXX - MARGIN_LEFT - MARGIN_RIGHT });
  invoice.fontSize(footerFontSize);
  let h1 = invoice.heightOfString(line1, MARGIN_RIGHT, MARGIN_TOP, { align: "center", width: MAXX - MARGIN_LEFT - MARGIN_RIGHT }) 
  invoice.fontSize(footerFontSize);
  let h2 = invoice.heightOfString(line2, MARGIN_RIGHT, MARGIN_TOP, { align: "center", width: MAXX - MARGIN_LEFT - MARGIN_RIGHT })
  let h3 = invoice.heightOfString(line3, MARGIN_RIGHT, MARGIN_TOP, { align: "center", width: MAXX - MARGIN_LEFT - MARGIN_RIGHT });
  
  console.log(`${h0}-${h1}-${h2}-${h3}`);
  
  let y = MAXY - MARGIN_BOTTOM - (h0 + h1 + h2 + h3);
  invoice.fontSize(footerFontSize);
  invoice.text(line0, MARGIN_RIGHT, y, { align: "center", width: MAXX - MARGIN_LEFT - MARGIN_RIGHT });
  y += h0;
  invoice
  .moveTo(MARGIN_LEFT, y - 0.3*h0)
  .lineTo(MAXX - MARGIN_RIGHT, y - 0.4*h0)
  .stroke();

  invoice.fontSize(bodyFontSize);
  invoice.text(line1, MARGIN_RIGHT, y, { align: "center", width: MAXX - MARGIN_LEFT - MARGIN_RIGHT });
  y += h1;
  invoice.fontSize(footerFontSize);
  invoice.text(line2, MARGIN_RIGHT, y, { align: "center", width: MAXX - MARGIN_LEFT - MARGIN_RIGHT });
  y += h2;
  invoice.text(line3, MARGIN_RIGHT, y, { align: "center", width: MAXX - MARGIN_LEFT - MARGIN_RIGHT });
  y += h3;
  invoice.fontSize(bodyFontSize);
  invoice.lineGap(0);
}

const generateReportFooter = function(){
}

const generateDetail = function(line){

  if (currentPositionY + MARGIN_BOTTOM + 120 > MAXY) invoice.addPage();

  let textOptions = { lineBreak: true, ellipsis: true };
  let numberOptions = { lineBreak: true, ellipsis: true, align: "right" };

  invoice.fontSize(9)
  .text(line.item, 30, currentPositionY, { width: 35, ...textOptions })
  .text(line.description, 70, currentPositionY, { width: 200, ...textOptions })
  .text(line.up, 275, currentPositionY, { width: 65, ...numberOptions })
  .text(line.qty, 345, currentPositionY, { width: 65, ...numberOptions})
  .text(line.discPercent, 410, currentPositionY, { width: 35, ...numberOptions })
  .text(line.amount, 445, currentPositionY, { width: 65, ...numberOptions })
  .text(line.vat, 510, currentPositionY, { width: 35, ...numberOptions });

  let itemHeight = invoice.heightOfString(line.item, { width: 35, ...textOptions });
  let descHeight = invoice.heightOfString(line.description, { width: 200, ...textOptions });

  currentPositionY += Math.max(itemHeight, descHeight) + ROW_SPACING;

  invoice.moveTo(MARGIN_LEFT, currentPositionY - ROW_SPACING/2)
    .lineTo(MAXX - MARGIN_RIGHT, currentPositionY - ROW_SPACING/2)
    .strokeColor("#ccc")
    .stroke();
}

function generateInvoice (invoiceData, res, resType = 'link'){
  data = invoiceData;
  if (resType == 'link'){
    let fileName = `invoice-${new Date().getTime()}.pdf`;
    try{
      console.log(`fileName is : http://localhost:3000/output/${fileName}`);
      invoice.pipe(fs.createWriteStream(`./public/output/${fileName}`));
  
      generatePageHeader(invoice);
      generatePageFooter(invoice);

      invoice.on('pageAdded', () => {
        pageNumber++;
        generatePageHeader(invoice);
        generatePageFooter(invoice);
      });
  
      data.content.forEach(invoiceLine => {
        generateDetail(invoiceLine)
      });
      generateReportFooter(invoice)
      invoice.end();
      return { result: true, message: `http://localhost:3000/output/${fileName}`};
    }
    catch(e){
      return { error : true, message: e.message};
    }
  }
  else{
    return { error : true, message: `The method ${resType} isn't Implemented Yet !`}
  }
}

module.exports = { 
  generateInvoice 
};