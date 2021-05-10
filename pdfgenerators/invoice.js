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
const MARGIN_BOTTOM = 5;
const ROW_SPACING = 5;
// Details Section
const detailLeftMargin = 5;
const itemStartAt = MARGIN_LEFT + detailLeftMargin;
const itemWidth = 35;
const descriptionStartAt = itemStartAt + itemWidth + detailLeftMargin
const descriptionWidth = 200;
const unitPriceStartAt = descriptionStartAt + descriptionWidth + detailLeftMargin
const unitPriceWidth = 65;
const qtyStartAt = unitPriceStartAt + unitPriceWidth + detailLeftMargin;
const qtyWidth = 65;
const discountPercentStartAt = qtyStartAt + qtyWidth + detailLeftMargin;
const discountPercentWidth = 35;
const amountStartAt = discountPercentStartAt + discountPercentWidth + detailLeftMargin;
const amountWidth = 65;
const vatPercentStartAt = amountStartAt + amountWidth + detailLeftMargin;
const vatPercentWidth = 35;

const BODY_FONT_SIZE = 9;
const FOOTER_FONT_SIZE = 7;

let currentPositionY = MARGIN_TOP;
let pageNumber = 1;
let pageFooterHeight = null;
let reportFooterHeight = null;


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
  .text(data.companyName, itemStartAt, currentPositionY)
  .font(`Helvetica`)
  .fontSize(1.5*BODY_FONT_SIZE)
  .text(data.companyActivity, itemStartAt, currentPositionY + 1.7*stepY)
  .fontSize(BODY_FONT_SIZE)
  .text(`Capital Social: ${data.companyCapital}`, itemStartAt, currentPositionY + 3*stepY)
  .text(`Adresse: ${data.companyAddress}`, itemStartAt, currentPositionY + 4*stepY)
  .text(`Tél.: ${data.companyPhone} - Email: ${data.companyEmail}`, itemStartAt, currentPositionY + 5*stepY)

  currentPositionY += Math.max(currentPositionY + 5*stepY, 50) ;

  invoice.lineWidth(1)
  .moveTo(MARGIN_LEFT, currentPositionY)
  .lineTo(MAXX - MARGIN_RIGHT, currentPositionY)
  .stroke();

  currentPositionY += 13;

}

const generateReportHeader = function(){
  invoice.font(`Helvetica-Bold`).fontSize(BODY_FONT_SIZE + 5);
  invoice.text(`${data.docType} ${data.reference}`, itemStartAt, currentPositionY);
  let height = invoice.heightOfString(`${data.docType} ${data.reference}`, itemStartAt, currentPositionY);
  
  invoice.font(`Helvetica`).fontSize(BODY_FONT_SIZE);
  invoice.text(`Date: ${data.date}`, discountPercentStartAt, currentPositionY, {width: MAXX - MARGIN_RIGHT - discountPercentStartAt, align: "right"});
  height = Math.max(height, invoice.heightOfString(`Date: ${data.date}`, discountPercentStartAt, currentPositionY, {width: MAXX - MARGIN_RIGHT - discountPercentStartAt, align: "right"}) );
  currentPositionY += height + 2*ROW_SPACING;

  let initialY = currentPositionY - ROW_SPACING;
  invoice.text(`Code: ${data.code}`, unitPriceStartAt, currentPositionY);
  currentPositionY += invoice.heightOfString(`Code: ${data.code}`, unitPriceStartAt, currentPositionY);

  invoice.font(`Helvetica-Bold`).fontSize(BODY_FONT_SIZE);
  invoice.text(`${data.name}`, unitPriceStartAt, currentPositionY);
  currentPositionY += invoice.heightOfString(`${data.name}`, unitPriceStartAt, currentPositionY);

  invoice.font(`Helvetica`);
  invoice.text(`${data.address}`, unitPriceStartAt, currentPositionY);
  currentPositionY += invoice.heightOfString(`Adresse :  ${data.address}`, unitPriceStartAt, currentPositionY);

  invoice.fontSize(BODY_FONT_SIZE - 2);
  invoice.text(`RC:${data.RC} - IF: ${data.IF} - AI: ${data.AI} - NIS:  ${data.NIS}`, unitPriceStartAt, currentPositionY);
  currentPositionY += invoice.heightOfString(`RC:${data.RC} - IF: ${data.IF} - AI: ${data.AI} - NIS:  ${data.NIS}`, unitPriceStartAt, currentPositionY);
  invoice
  .lineWidth(0.2)
  .roundedRect(unitPriceStartAt - 5, initialY, MAXX - MARGIN_RIGHT - unitPriceStartAt, currentPositionY - initialY, 3)
  .stroke();

  currentPositionY += 5*ROW_SPACING;
}

const generateDetailsHeader = function(){
  invoice.font('Helvetica-Bold');
  generateDetail({ line: '#', item: "Code", description: "Description", up: "PU", qty: "Qté", vat: "TVA%", discPercent: "Rem%", amount: "Montant" });
  invoice.font('Helvetica');
}

const generateDetail = function(line, isLastRecord = false){

  let textOptions = { lineBreak: true, ellipsis: true };
  let numberOptions = { lineBreak: true, ellipsis: true, align: "right" };
  
  let maxHeight = invoice.heightOfString(line.item, { width: itemWidth, ...textOptions });
  maxHeight = Math.max(maxHeight, invoice.heightOfString(line.description, { width: descriptionWidth, ...textOptions }));

  if (currentPositionY 
      + maxHeight 
      + MARGIN_BOTTOM
      + (isLastRecord ? reportFooterHeight : 0)    // on the last record, add report footer too
      + pageFooterHeight      > MAXY){
    currentPositionY = MARGIN_TOP;
    invoice.addPage();
  }
  invoice.fontSize(9);
  if(isNaN(line.up)){ // return true when generating details Header
    invoice
    .text(line.item, itemStartAt, currentPositionY, { width: itemWidth, ...textOptions })
    .text(line.description, descriptionStartAt, currentPositionY, { width: descriptionWidth, ...textOptions })
    .text(line.up, unitPriceStartAt, currentPositionY, { width: unitPriceWidth, ...numberOptions })
    .text(line.qty, qtyStartAt, currentPositionY, { width: qtyWidth, ...numberOptions})
    .text(line.discPercent, discountPercentStartAt, currentPositionY, { width: discountPercentWidth, ...numberOptions })
    .text(line.amount, amountStartAt, currentPositionY, { width: amountWidth, ...numberOptions })
    .text(line.vat, vatPercentStartAt, currentPositionY, { width: vatPercentWidth, ...numberOptions });
  }
  else{
    invoice
    .text(line.item, itemStartAt, currentPositionY, { width: itemWidth, ...textOptions })
    .text(line.description, descriptionStartAt, currentPositionY, { width: descriptionWidth, ...textOptions })
    .text(line.up.toFixed(2), unitPriceStartAt, currentPositionY, { width: unitPriceWidth, ...numberOptions })
    .text(line.qty.toFixed(2), qtyStartAt, currentPositionY, { width: qtyWidth, ...numberOptions})
    .text(line.discPercent.toFixed(2), discountPercentStartAt, currentPositionY, { width: discountPercentWidth, ...numberOptions })
    .text(line.amount.toFixed(2), amountStartAt, currentPositionY, { width: amountWidth, ...numberOptions })
    .text(line.vat.toFixed(2), vatPercentStartAt, currentPositionY, { width: vatPercentWidth, ...numberOptions });
  }

  currentPositionY += maxHeight + ROW_SPACING;

  invoice.moveTo(MARGIN_LEFT, currentPositionY - ROW_SPACING)
    .lineTo(MAXX - MARGIN_RIGHT, currentPositionY - ROW_SPACING)
    .stroke();
}

const generateReportFooter = function(calculateOnly = false){
  const x1 = qtyStartAt;
  const x2 = amountStartAt;
  let options1 = { width: qtyWidth + detailLeftMargin + discountPercentWidth };
  let options2 = { align: 'right', width: amountWidth + detailLeftMargin + vatPercentWidth };

  invoice.font(`Helvetica-Bold`).fontSize(BODY_FONT_SIZE + 1);
  let startY = MARGIN_TOP; // Let's suppose we'll start at the top of the page
  
  let h1 = invoice.heightOfString(`Montant HT`, x1, startY, options1);
  let h2 = (data.discountAmount ? invoice.heightOfString(`Remise (${data.discountPercent.toFixed(2)}%)`, x1, startY + h1, options1) : 0);
  let h3 = (data.discountAmount ? invoice.heightOfString(`Net HT`, x1, startY + h1 + h2, options1) : 0);
  let h4 = invoice.heightOfString(`TVA`, x1, startY + h1 + h2 + h3, options1);
  let h5 = invoice.heightOfString(`Timbre`, x1, startY + h1 + h2 + h3 + h4, options1);
  let h6 = invoice.heightOfString(`TTC`, x1, startY + h1 + h2 + h3 + h4 + h5, options1);
  
  invoice.font('Helvetica').fontSize(BODY_FONT_SIZE + 1);
  h1 = Math.max(h1, invoice.heightOfString(data.rawAmount.toFixed(2), x2, startY, options2));
  h2 = Math.max(h2, (data.discountAmount ? invoice.heightOfString(data.discountAmount.toFixed(2), x2, startY + h1, options2) : 0 ));
  h3 = Math.max(h2, (data.discountAmount ? invoice.heightOfString(data.netAmount.toFixed(2), x2, startY + h1 + h2, options2) : 0 ));
  h4 = Math.max(h4, invoice.heightOfString( data.vatAmount.toFixed(2), x2, startY + h1 + h2 + h3, options2));
  h5 = Math.max(h5, invoice.heightOfString( data.stampAmount.toFixed(2), x2, startY + h1 + h2 + h3 + h4, options2));
  h6 = Math.max(h6, invoice.heightOfString( data.amountit.toFixed(2), x2, startY + h1 + h2 + h3 + h4 + h5, options2));

  if (!reportFooterHeight){
    reportFooterHeight = h1 + h2 + h3 + h4 + h5 + h6 + 2*ROW_SPACING;
  }
  if (calculateOnly) return;

  currentPositionY = MAXY - (MARGIN_BOTTOM + reportFooterHeight + pageFooterHeight);

  invoice.font(`Helvetica-Bold`).fontSize(BODY_FONT_SIZE + 1);
  invoice.text(`Montant HT`, x1, currentPositionY);
  if (data.discountAmount){
    invoice.text(`Remise (${data.discountPercent.toFixed(2)}%)`, x1, currentPositionY + h1, options1);
    invoice.text(`Net HT`, x1, currentPositionY + h1 + h2, options1);
  }
  invoice.text(`TVA`, x1, currentPositionY + h1 + h2 + h3, options1);
  invoice.text(`Timbre`, x1, currentPositionY + h1 + h2 + h3 + h4, options1);
  invoice.text(`TTC`, x1, currentPositionY + h1 + h2 + h3 + h4 + h5, options1);


  invoice.font('Helvetica').fontSize(BODY_FONT_SIZE + 1);
  invoice.text(data.rawAmount.toFixed(2), x2, currentPositionY, options2);
  if (data.discountAmount){
    invoice.text(data.discountAmount.toFixed(2), x2, currentPositionY + h1, options2);
    invoice.text(data.netAmount.toFixed(2), x2, currentPositionY + h1 + h2, options2);
  };
  invoice.text(data.vatAmount.toFixed(2), x2, currentPositionY + h1 + h2 + h3, options2);
  invoice.text(data.stampAmount.toFixed(2), x2, currentPositionY + h1 + h2 + h3 + h4, options2);
  invoice.text(data.amountit.toFixed(2), x2, currentPositionY + h1 + h2 + h3 + h4 + h5, options2);

  invoice
  .lineWidth(0.2)
  .roundedRect(x1 - 5, MAXY - (MARGIN_BOTTOM + reportFooterHeight + pageFooterHeight + 2*ROW_SPACING), MAXX - x1 - MARGIN_RIGHT, reportFooterHeight, 3)
  .stroke();

  currentPositionY += reportFooterHeight;
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
  if (!pageFooterHeight){
    pageFooterHeight = h0 + h1 + h2 + h3 + 2*ROW_SPACING
  }
  
  let y = MAXY - MARGIN_BOTTOM - pageFooterHeight;

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
      generateDetailsHeader();
      generateReportFooter(true);

      invoice.on('pageAdded', () => {
        pageNumber++;
        generatePageHeader();
        generateReportHeader();
        generatePageFooter();
        generateDetailsHeader()
      });

      for (let i = 0; i < data.content.length - 1; i++){
        generateDetail(data.content[i]);
      }
      if (data.content.length > 0){ // check if the content (details) array is not empty
        generateDetail(data.content[data.content.length - 1], true) // check if there no space left for footer sections on last page (it will add a new page if so)
      }
      generateReportFooter()
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