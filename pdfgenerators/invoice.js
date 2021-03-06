// 'use strict'

const fs = require ('fs');
const PDFDocument = require ('pdfkit');

const SIZE = 'A4';
const MAXX = 595;
const MAXY = 841;
const MARGIN_TOP = 10;
const MARGIN_RIGHT = 10;
const MARGIN_BOTTOM = 10;
const MARGIN_LEFT = 20;
const ROW_SPACING = 5;
// Details Section
const detailLeftMargin = 5;
const itemStartAt = MARGIN_LEFT + detailLeftMargin;
const itemWidth = 35;
const descriptionStartAt = itemStartAt + itemWidth + detailLeftMargin;
const descriptionWidth = 215;
const unitPriceStartAt = descriptionStartAt + descriptionWidth + detailLeftMargin;
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

const invoicePDFGenerator = {
  data : null,
  currentPositionY : MARGIN_TOP,
  pageNumber : 1,
  pageFooterHeight : null,
  reportFooterHeight : null,
  invoice: null,

  generatePageHeader: function(){
    this.invoice.image('images/logo.png',MAXX - MARGIN_RIGHT - 140, MARGIN_TOP, {width: 140, height: 70})
    this.currentPositionY = 15;
    let stepY = 13;
  
    this.invoice
    .font(`Helvetica-Bold`)
    .fontSize(2*BODY_FONT_SIZE)
    .text(this.data.company.companyname, itemStartAt, this.currentPositionY)
    .font(`Helvetica`)
    .fontSize(1.5*BODY_FONT_SIZE)
    .text(this.data.company.companyactivity, itemStartAt, this.currentPositionY + 1.7*stepY)
    .fontSize(BODY_FONT_SIZE)
    .text(`Capital Social: ${this.data.company.companycapital}`, itemStartAt, this.currentPositionY + 3*stepY)
    .text(`Adresse: ${this.data.company.companyaddress}`, itemStartAt, this.currentPositionY + 4*stepY)
    .text(`Tél.: ${this.data.company.companyphone} - Email: ${this.data.company.companyemail}`, itemStartAt, this.currentPositionY + 5*stepY)
  
    this.currentPositionY += Math.max(this.currentPositionY + 5*stepY, 50) ;
  
    this.invoice.lineWidth(1)
    .moveTo(MARGIN_LEFT, this.currentPositionY)
    .lineTo(MAXX - MARGIN_RIGHT, this.currentPositionY)
    .stroke();
  
    this.currentPositionY += 13;
  
  },
  generateReportHeader: function(){
    this.invoice.font(`Helvetica-Bold`).fontSize(BODY_FONT_SIZE + 5);
    this.invoice.text(`${this.data.header.doctype} ${this.data.header.reference}`, itemStartAt, this.currentPositionY);
    let height = this.invoice.heightOfString(`${this.data.header.doctype} ${this.data.header.reference}`, itemStartAt, this.currentPositionY);
    
    this.invoice.font(`Helvetica`).fontSize(BODY_FONT_SIZE);
    this.invoice.text(`Date: ${this.data.header.date}`, discountPercentStartAt, this.currentPositionY, {width: vatPercentStartAt + vatPercentWidth - discountPercentStartAt, align: "right"});
    height = Math.max(height, this.invoice.heightOfString(`Date: ${this.data.header.date}`, discountPercentStartAt, this.currentPositionY, {width: MAXX - MARGIN_RIGHT - discountPercentStartAt, align: "right"}) );
    this.currentPositionY += height + 2*ROW_SPACING;
  
    let initialY = this.currentPositionY - ROW_SPACING;
    this.invoice.text(`Code: ${this.data.header.code}`, unitPriceStartAt, this.currentPositionY);
    this.currentPositionY += this.invoice.heightOfString(`Code: ${this.data.header.code}`, unitPriceStartAt, this.currentPositionY) + 0.5*ROW_SPACING;
  
    this.invoice.font(`Helvetica-Bold`).fontSize(BODY_FONT_SIZE);
    this.invoice.text(`${this.data.header.name}`, unitPriceStartAt, this.currentPositionY);
    this.currentPositionY += this.invoice.heightOfString(`${this.data.header.name}`, unitPriceStartAt, this.currentPositionY) + 0.5*ROW_SPACING;
  
    this.invoice.font(`Helvetica`);
    this.invoice.text(`${this.data.header.address}`, unitPriceStartAt, this.currentPositionY);
    this.currentPositionY += this.invoice.heightOfString(`Adresse :  ${this.data.header.address}`, unitPriceStartAt, this.currentPositionY) + 0.5*ROW_SPACING;
  
    this.invoice.fontSize(BODY_FONT_SIZE - 2);
    this.invoice.text(`RC:${this.data.header.rc} - IF: ${this.data.header.if} - AI: ${this.data.header.ai} - NIS:  ${this.data.header.nis}`, unitPriceStartAt, this.currentPositionY);
    this.currentPositionY += this.invoice.heightOfString(`RC:${this.data.header.rc} - IF: ${this.data.header.if} - AI: ${this.data.header.ai} - NIS:  ${this.data.company.nis}`, unitPriceStartAt - 10, this.currentPositionY) + 0.5*ROW_SPACING;
    this.invoice
    .lineWidth(0.2)
    .roundedRect(unitPriceStartAt - 5, initialY, MAXX - MARGIN_RIGHT - unitPriceStartAt + 5, this.currentPositionY - initialY, 3)
    .stroke();
  
    this.currentPositionY += 5*ROW_SPACING;
  },
  generateDetailsHeader: function(){
    this.invoice.font('Helvetica-Bold');
    this.generateDetail({ line: '#', item: "Code", description: "Description", up: "PU", qty: "Qté", vat: "TVA%", discpercent: "Rem%", amount: "Montant" });
    this.invoice.font('Helvetica');
  },
  generateDetail: function(line, isLastRecord = false){
  
    // console.log(`GENERATING DETAIL LINE`);
    // console.log(line);
    // console.log(`GENERATING DETAIL LINE`);

    let textOptions = { lineBreak: true, ellipsis: true };
    let numberOptions = { lineBreak: true, ellipsis: true, align: "right" };
    
    let maxHeight = this.invoice.heightOfString(line.item, { width: itemWidth, ...textOptions });
    maxHeight = Math.max(maxHeight, this.invoice.heightOfString(line.description, { width: descriptionWidth, ...textOptions }));
  
    if (this.currentPositionY 
        + maxHeight 
        + MARGIN_BOTTOM
        + (isLastRecord ? this.reportFooterHeight : 0)    // on the last record, add report footer too
        + this.pageFooterHeight      > MAXY){
      this.currentPositionY = MARGIN_TOP;
      this.invoice.addPage({size: SIZE, margins: { top: MARGIN_TOP, right: MARGIN_RIGHT, bottom: MARGIN_BOTTOM, left: MARGIN_LEFT }});
    }
    this.invoice.fontSize(9);
    this.invoice
    .text(line.item, itemStartAt, this.currentPositionY, { width: itemWidth, ...textOptions })
    .text(line.description, descriptionStartAt, this.currentPositionY, { width: descriptionWidth, ...textOptions })
    .text(line.up, unitPriceStartAt, this.currentPositionY, { width: unitPriceWidth, ...numberOptions })
    .text(line.qty, qtyStartAt, this.currentPositionY, { width: qtyWidth, ...numberOptions})
    .text(line.discpercent, discountPercentStartAt, this.currentPositionY, { width: discountPercentWidth, ...numberOptions })
    .text(line.amount, amountStartAt, this.currentPositionY, { width: amountWidth, ...numberOptions })
    .text(line.vat, vatPercentStartAt, this.currentPositionY, { width: vatPercentWidth, ...numberOptions });
  
    this.currentPositionY += maxHeight + ROW_SPACING;
  
    this.invoice.moveTo(MARGIN_LEFT, this.currentPositionY - ROW_SPACING)
      .lineTo(MAXX - MARGIN_RIGHT, this.currentPositionY - ROW_SPACING)
      .strokeColor(`#999`)
      .stroke();
  },
  generateReportFooter: function(calculateOnly){
    const x1 = qtyStartAt;
    const x2 = amountStartAt;
    let options1 = { width: qtyWidth + detailLeftMargin + discountPercentWidth };
    let options2 = { align: 'right', width: amountWidth + detailLeftMargin + vatPercentWidth };
  
    this.invoice.font(`Helvetica-Bold`).fontSize(BODY_FONT_SIZE + 1);
    let startY = MARGIN_TOP; // Let's suppose we'll start at the top of the page
    
    let h1 = this.invoice.heightOfString(`Montant HT`, x1, startY, options1);
    let h2 = (this.data.footer.discountamount != '0.00' && this.data.footer.discountamount != '0,00' ? this.invoice.heightOfString(`Remise (${this.data.footer.discountpercent}%)`, x1, startY + h1, options1) : 0);
    let h3 = (this.data.footer.discountamount != '0.00' && this.data.footer.discountamount != '0,00'? this.invoice.heightOfString(`Net HT`, x1, startY + h1 + h2, options1) : 0);
    let h4 = this.invoice.heightOfString(`TVA`, x1, startY + h1 + h2 + h3, options1);
    let h5 = this.invoice.heightOfString(`Timbre`, x1, startY + h1 + h2 + h3 + h4, options1);
    let h6 = this.invoice.heightOfString(`TTC`, x1, startY + h1 + h2 + h3 + h4 + h5, options1);
    
    this.invoice.font('Helvetica').fontSize(BODY_FONT_SIZE + 1);
    h1 = Math.max(h1, this.invoice.heightOfString(this.data.footer.rawamount, x2, startY, options2));
    h2 = Math.max(h2, (this.data.footer.discountamount != '0.00' && this.data.footer.discountamount != '0,00' ? this.invoice.heightOfString(this.data.footer.discountamount, x2, startY + h1, options2) : 0 ));
    h3 = Math.max(h2, (this.data.footer.discountamount != '0.00' && this.data.footer.discountamount != '0,00' ? this.invoice.heightOfString(this.data.footer.netamount, x2, startY + h1 + h2, options2) : 0 ));
    h4 = Math.max(h4, this.invoice.heightOfString( this.data.footer.vatamount, x2, startY + h1 + h2 + h3, options2));
    h5 = Math.max(h5, this.invoice.heightOfString( this.data.footer.stampamount, x2, startY + h1 + h2 + h3 + h4, options2));
    h6 = Math.max(h6, this.invoice.heightOfString( this.data.footer.amountit, x2, startY + h1 + h2 + h3 + h4 + h5, options2));
  
    if (!this.reportFooterHeight){
      this.reportFooterHeight = h1 + h2 + h3 + h4 + h5 + h6 + 2*ROW_SPACING;
    }
    if (calculateOnly) return;
  
    this.currentPositionY = MAXY - (MARGIN_BOTTOM + this.reportFooterHeight + this.pageFooterHeight);
  
    this.invoice.font(`Helvetica-Bold`).fontSize(BODY_FONT_SIZE + 1);
    this.invoice.text(`Montant HT`, x1, this.currentPositionY);
    if (this.data.footer.discountamount != '0.00' && this.data.footer.discountamount != '0,00'){
      this.invoice.text(`Remise (${this.data.footer.discountpercent}%)`, x1, this.currentPositionY + h1, options1);
      this.invoice.text(`Net HT`, x1, this.currentPositionY + h1 + h2, options1);
    }
    this.invoice.text(`TVA`, x1, this.currentPositionY + h1 + h2 + h3, options1);
    this.invoice.text(`Timbre`, x1, this.currentPositionY + h1 + h2 + h3 + h4, options1);
    this.invoice.text(`TTC`, x1, this.currentPositionY + h1 + h2 + h3 + h4 + h5, options1);
  
  
    this.invoice.font('Helvetica').fontSize(BODY_FONT_SIZE + 1);
    this.invoice.text(this.data.footer.rawamount, x2, this.currentPositionY, options2);
    if (this.data.footer.discountamount != '0.00' && this.data.footer.discountamount != '0,00'){
      this.invoice.text(this.data.footer.discountamount, x2, this.currentPositionY + h1, options2);
      this.invoice.text(this.data.footer.netamount, x2, this.currentPositionY + h1 + h2, options2);
    };
    this.invoice.text(this.data.footer.vatamount, x2, this.currentPositionY + h1 + h2 + h3, options2);
    this.invoice.text(this.data.footer.stampamount, x2, this.currentPositionY + h1 + h2 + h3 + h4, options2);
    this.invoice.text(this.data.footer.amountit, x2, this.currentPositionY + h1 + h2 + h3 + h4 + h5, options2);
  
    this.invoice
    .lineWidth(0.2)
    .roundedRect(x1 - 5, MAXY - (MARGIN_BOTTOM + this.reportFooterHeight + this.pageFooterHeight + 2*ROW_SPACING), MAXX - x1 - MARGIN_RIGHT, this.reportFooterHeight, 3)
    .stroke();
  
    this.currentPositionY += this.reportFooterHeight;
  },
  generatePageFooter: function(){
    this.invoice.lineWidth(0.3).fontSize(FOOTER_FONT_SIZE);

    let line0 = `Page ${this.pageNumber} `;  
    let line1 = this.data.company.companyname;
    let line2 = `Adresse: ${this.data.company.companyaddress} `;
    let line3 = `RC: ${this.data.company.companyrc} - IF: ${this.data.company.companyif} - NIS: ${this.data.company.companynis} - AI: ${this.data.company.companyai} - Tél: ${this.data.company.companyphone} - Email:${this.data.company.companyemail} `;
  
    this.invoice.fontSize(FOOTER_FONT_SIZE);
    let h0 = this.invoice.heightOfString(line0, MARGIN_RIGHT, MARGIN_TOP, { align: "center", width: MAXX - MARGIN_LEFT - MARGIN_RIGHT });
    this.invoice.font('Helvetica-Bold').fontSize(FOOTER_FONT_SIZE);
    let h1 = this.invoice.heightOfString(line1, MARGIN_RIGHT, MARGIN_TOP, { align: "center", width: MAXX - MARGIN_LEFT - MARGIN_RIGHT }) 
    this.invoice.font('Helvetica').fontSize(FOOTER_FONT_SIZE);
    let h2 = this.invoice.heightOfString(line2, MARGIN_RIGHT, MARGIN_TOP, { align: "center", width: MAXX - MARGIN_LEFT - MARGIN_RIGHT })
    let h3 = this.invoice.heightOfString(line3, MARGIN_RIGHT, MARGIN_TOP, { align: "center", width: MAXX - MARGIN_LEFT - MARGIN_RIGHT });
    if (!this.pageFooterHeight){
      this.pageFooterHeight = h0 + h1 + h2 + h3 + 2*ROW_SPACING
    }
    // console.log(`$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$`);
    // console.log(`${this.pageFooterHeight} = ${h0} + ${h1} + ${h2} + ${h3} + ${2*ROW_SPACING}`);
    // console.log(`$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$`);
    let y = MAXY - (MARGIN_BOTTOM + this.pageFooterHeight);
    this.invoice.fontSize(FOOTER_FONT_SIZE);
    
    this.invoice.text(line0, MARGIN_RIGHT, y, { align: "center", width: MAXX - (MARGIN_LEFT + MARGIN_RIGHT) });
    y += h0;
    this.invoice
    .moveTo(MARGIN_LEFT, y - 0.3*h0)
    .lineTo(MAXX - MARGIN_RIGHT, y - 0.4*h0)
    .stroke();
  
    this.invoice
    .font('Helvetica-Bold')
    .fontSize(BODY_FONT_SIZE)
    .text(line1, MARGIN_RIGHT, y, { align: "center", width: MAXX - MARGIN_LEFT - MARGIN_RIGHT })
    .font('Helvetica');
    y += h1;
    this.invoice.fontSize(FOOTER_FONT_SIZE);
    this.invoice.text(line2, MARGIN_RIGHT, y, { align: "center", width: MAXX - MARGIN_LEFT - MARGIN_RIGHT });
    y += h2;
    this.invoice.text(line3, MARGIN_RIGHT, y, { align: "center", width: MAXX - MARGIN_LEFT - MARGIN_RIGHT });
    y += h3;
    this.invoice.fontSize(BODY_FONT_SIZE);
  },
  hr: function(posY = this.currentPositionY){
    this.invoice
    .moveTo(MARGIN_LEFT, posY)
    .lineTo(MAXX - MARGIN_RIGHT, posY)
    .stroke();
    ;
  },
  generateInvoice: function (invoiceData, resType = 'link'){
    this.data = invoiceData;
    // console.log(`DATA IS.....`);
    // console.log(this.data);
    this.invoice = new PDFDocument({ size: SIZE, margins: { top: MARGIN_TOP, right: MARGIN_RIGHT, bottom: MARGIN_BOTTOM, left: MARGIN_LEFT }});
    this.pageNumber = 1;
    this.invoice.font('Helvetica').lineGap(3);
    this.invoice.info = { Title: 'Invoice #1234', displayTitle: true, Author: 'You', CreationDate: new Date(), Producer: 'Kwik Gestion', Creator: 'Me', Keywords: 'this.invoice, 1234, kwik, You, Me'};

    let randomString = '';
    for (let i = 0; i <= 7; i++){
      randomString += String.fromCharCode( Math.round(1024*Math.random()%16, 0) + 97)
    }

    if (resType == 'link'){
      let fileName = `invoice-${randomString}${new Date().getTime()}.pdf`;
      try{
        this.invoice.pipe(fs.createWriteStream(`./public/output/${fileName}`));
        this.generatePageHeader();
        this.generateReportHeader();
        this.generatePageFooter();
        this.generateDetailsHeader();
        this.generateReportFooter(true);
        
        this.invoice.on('pageAdded', ()=>{
          this.pageNumber++;
          this.currentPositionY = MARGIN_TOP;
          this.generatePageHeader();
          this.generateReportHeader();
          this.generatePageFooter();
          this.generateDetailsHeader()      
        });
        
        if (this.data.content.length > 0 &&  (this.data.content[this.data.content.length - 1].description != "  ########## FIN ##########  "))
          {
            this.data.content.push({ line: '', item: "#####", description: "############ FIN ##########  ", up: "#####", qty: "#####", vat: "#####", discpercent: "######", amount: "###########" })
          }
        
        for (let i = 0; i < this.data.content.length - 1; i++){
          this.generateDetail(this.data.content[i]);
        }
        if (this.data.content.length > 0){ // check if the content (details) array is not empty
          this.generateDetail(this.data.content[this.data.content.length - 1], true) // check if there no space left for footer sections on last page (it will add a new page if so)
        }
        this.generateReportFooter(false)
        this.invoice.end();
        return { error: false, resultUri: `http://localhost:3000/output/${fileName}`};
      }
      catch(e){
        console.trace(e);
        return { error: true, message: e.message};
      }
    }
    else{
      return { error: true, message: `The method ${resType} isn't Implemented Yet !`}
    }
  }
}


module.exports = { 
  invoicePDFGenerator
};