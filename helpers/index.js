const MAXX = 595;
const MAXY = 841;

const printGrid = function(doc, gap){
    for (var x = 1; x <= MAXX; x += gap)
      for (var y = 1; y <= MAXY; y += gap)
        {
          doc.moveTo(x, 1);
          doc.lineTo(x, MAXY);
          doc.moveTo(1, y);
          doc.lineTo(MAXX, y);
        }
    doc.strokeColor("#aaa");
    doc.stroke();
    doc.text(`${10*gap}x${10*gap} (${gap})`, 10*gap, 10*gap, {fontSize: gap});
  }

  module.exports = printGrid;