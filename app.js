const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const bodyParser = require('body-parser');
const redis = require('redis');
const methodOverride = require('method-override');

//Creating redis client
let client = redis.createClient();

client.on('connect', () => {
    console.log('Redis Connected...');
});

// Set Port
const port = 3000;

// Init Express
const app = express();

// Set View Engine
app.engine('handlebars', exphbs({
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

//body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

// MethodOverride
app.use(methodOverride('_method'));

// Search Page
app.get('/', (req, res) => {
    res.render('home');
});

app.post('/user/search', (req, res) => {
    let id = req.body.id;
    client.hgetall(id, (err, obj) => {
        if (!obj) {
            res.render('home', {
                error: 'User Not Exists'
            });
        } else {
            obj.id = id;
            res.render('details', {
                user: obj
            });
        }
    });
});

app.get('/add', (req, res) => {
    res.render('add');
});

app.post('/user/add', (req, res) => {

    let id = req.body.id;
    let fname = req.body.fname;
    let lname = req.body.lname;
    let email = req.body.email;

    client.hmset(id, [
        'first_name', fname,
        'last_name', lname,
        'email', email
    ], (err, reply) => {
        if (err) {
            console.log('Error : ' + err);
        } else {
            console.log('Replay : ' + reply);
            res.redirect('/');
        }
    });
});

app.delete('/user/delete/:id', (req, res) => {
    client.del(req.params.id);
    res.redirect('/');
});

app.listen(port, () => {
    console.log('Server Started On ' + port);
});