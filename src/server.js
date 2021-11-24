import express from 'express';

const app = express();

app.set('view engine', 'pug');
app.set('views', __dirname + '/views');
// static은 유저가 볼 수 있는 폴더를 지정하는거.
app.use('/public', express.static(__dirname + '/public'));

app.get('/', (req, res) => res.render('home'));
app.get('/*', (req, res) => res.redirect('/'));

const handleListen = () => console.log(`Listening on http://localhost:3000`);
app.listen(3000, handleListen);
