const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const validate = require('mongoose-validator');
const session = require('express-session');
const flash = require('express-flash');

app.use(session({
    secret: 'guatemalanwatermelon',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
}));

app.use(express.static(path.join(__dirname, './public')));
app.use(flash());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');
mongoose.connect('mongodb://localhost/hedgehogs', { useNewUrlParser: true });

// Fields:
//  1.   Common Name
//  2.   Binomial Name
//  3.   Description (ex. The European hedgehog or Erinaceus europaeus lives in various western and northern European countries such as Italy, Spain, France and the United Kingdom, among others. It is also known as 'common hedgehog'.)
//  4.   Image URL

var HedgehogSchema = new mongoose.Schema({
    commonName: {
        type: String,
        required: [true, 'Common name is required.'],
        validate: [
            validate({
                validator: 'isLength',
                arguments: [2, 100],
                message: 'Common name must be between {ARGS[0]} and {ARGS[1]} characters.'
            })
        ]
    },
    binomialName: {
        type: String,
        required: [true, 'Binomial name is required.'],
        validate: [
            validate({
                validator: 'isLength',
                arguments: [2, 100],
                message: 'Binomial name must be between {ARGS[0]} and {ARGS[1]} characters.'
            })
        ]
    },
    imageURL: {
        type: String,
        required: [true, 'Image URL is required.'],
        validate: [
            validate({
                validator: 'isLength',
                arguments: [2, 500],
                message: 'Image URL must be between {ARGS[0]} and {ARGS[1]} characters.'
            })
        ]
    },
    description: {
        type: String,
        required: [true, 'Description name is required.'],
        validate: [
            validate({
                validator: 'isLength',
                arguments: [2, 1000],
                message: 'Description must be between {ARGS[0]} and {ARGS[1]} characters.'
            })
        ]
    }
}, {
        timestamps: true
    });

var Hedgehog = mongoose.model('Hedgehog', HedgehogSchema);

// index route
app.get('/', function (req, res) {
    Hedgehog.find({}, function (err, hedgehogs) {
        res.render('index', { hedgehogs: hedgehogs });
    });
});

// display the form to create a new hedgehog
app.get('/hedgehogs/new', function (req, res) {
    res.render('hedgehog-new');
});

app.post('/hedgehogs', function (req, res) {
    var hedgehog = new Hedgehog({ commonName: req.body.commonName, binomialName: req.body.binomialName, imageURL: req.body.imageURL, description: req.body.description });
    hedgehog.save(function (err) {
        if (err) {
            if (err.errors.commonName) {
                req.flash('commonNameError', err.errors.commonName.message);
            }
            if (err.errors.binomialName) {
                req.flash('binomialNameError', err.errors.binomialName.message);
            }
            if (err.errors.imageURL) {
                req.flash('imageURLError', err.errors.imageURL.message);
            }
            if (err.errors.description) {
                req.flash('descriptionError', err.errors.description.message);
            }
            console.log('Error: hedgehog not saved.');
            res.redirect('/hedgehogs/new');
        } else {
            console.log('Success: added a hedgehog.');
            console.log(hedgehog);
            res.redirect('/');
        }
    });
});

app.get('/hedgehogs/:id', function (req, res){
    Hedgehog.findOne({_id:req.params.id}, function (err, hedgehog) {
        var hedgehog = hedgehog;
        res.render('hedgehog', { hedgehog: hedgehog });
    });
});

app.get('/hedgehogs/edit/:id', function (req, res){
    Hedgehog.findOne({_id:req.params.id}, function (err, hedgehog) {
        var hedgehog = hedgehog;
        res.render('hedgehog-edit', { hedgehog: hedgehog });
    });
});

app.post('/hedgehogs/:id', function (req, res){
    Hedgehog.findOne({_id:req.params.id}, function (err, hedgehog) {
        hedgehog.commonName = req.body.commonName;
        hedgehog.binomialName = req.body.binomialName;
        hedgehog.imageURL = req.body.imageURL;
        hedgehog.description = req.body.description;
        hedgehog.save(function(err){
            if (err) {
                if (err.errors.commonName) {
                    req.flash('commonNameError', err.errors.commonName.message);
                }
                if (err.errors.binomialName) {
                    req.flash('binomialNameError', err.errors.binomialName.message);
                }
                if (err.errors.imageURL) {
                    req.flash('imageURLError', err.errors.imageURL.message);
                }
                if (err.errors.description) {
                    req.flash('descriptionError', err.errors.description.message);
                }
                console.log('Error: hedgehog not edited.');
                res.redirect(`/hedgehogs/edit/${hedgehog.id}`);
            } else {
                console.log('Success: edited a hedgehog.');
                res.redirect(`/hedgehogs/${hedgehog.id}`);
            }
        });
    });
});

app.get('/hedgehogs/destroy/:id', function (req, res){
    Hedgehog.remove({_id:req.params.id}, function (err) {
        res.redirect('/');
    });
});

app.listen(8000, function () {
    console.log('listening on port 8000');
});