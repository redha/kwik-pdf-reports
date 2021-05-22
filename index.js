const express = require ('express');
var path = require('path');

// Create the app (the application)
const app = new express();
app.disable('x-powered-by');

// App can handle json, encoded urls and define static folder
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    console.log(req.body);
    //res.status(201).send({"error":false,"resultUri":"http://localhost:3000/output/invoice-reponse-model.pdf"});
    next();
});

// Allow Cross-Origin *
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://localhost:3333");
    res.header("Access-Control-Allow-Headers", "Content-Type, authorization");
    res.header("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
    res.header("Content-Type", "application/json");
    //res.header("Access-Control-Max-Age", 30);
    next();
});

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