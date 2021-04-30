const express = require ('express');
var path = require('path');

// Create the app (the application)
const app = new express();

// App can handle json, encoded urls and define statix folder
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes definition
var invoiceRouter = require('./routes/invoice-route.js');

// Routes linking with the app
app.use('/invoice', invoiceRouter);

// all undefined roures (error)
app.all('*', (req, res) => {
    console.log(`${req.method} - ${req.url}`);
    res.status(404).send({message: `${req.url} not found`});
});

// lunch the app (server)
const port = 3000;
app.listen(port, () => { console.log(`App And Running.... from port ${port}`) });