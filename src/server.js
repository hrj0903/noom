//http는 nodejs에 내장되어있음.
import http from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import express from 'express';
import { SocketAddress } from 'net';

const app = express();

app.set('view engine', 'pug');
app.set('views', __dirname + '/views');
// static은 유저가 볼 수 있는 폴더를 지정하는거.
app.use('/public', express.static(__dirname + '/public'));

app.get('/', (_, res) => res.render('home'));
app.get('/*', (_, res) => res.redirect('/'));

const handleListen = () => console.log(`Listening on http://localhost:3000`);

//서버 생성.
//express는 ws를 지원안하므로 이렇게 작성하는 거임.
//아래 두개의 코드는 필수사항 아님. websocket만 만들어도 됨.
//http와 WebSocket이 같은 port에 있길 원하기 때문에 이렇게 작성.
//http를 설정한 이유는 views,static files, home, redirect를 원하기 때문에 만듬.
const server = http.createServer(app);
//웹소켓 서버 생성.
//이렇게 작성하면 같은 서버에서 http, webSocket 둘 다 작동
//express.js위에 http, http위에 websocket서버 만듬.
const wss = new WebSocketServer({ server });

//브라우저마다 소켓을 보내기 위한 데이터베이스 역할.
const sockets = [];

//socket이 frontend와 real-time으로 소통할 수 있음.
wss.on('connection', (socket) => {
  sockets.push(socket);
  socket['nickname'] = 'Anon';
  console.log('Connected to Browser ✅');
  socket.on('close', () => console.log('Disconnected from the Browser ❌'));
  socket.on('message', (msg) => {
    const message = JSON.parse(msg);
    switch (message.type) {
      case 'new_message':
        sockets.forEach((aSocket) =>
          aSocket.send(`${socket.nickname}: ${message.payload}`)
        );
        break;
      case 'nickname':
        // socket은 기본적으로 객체여서 아래와 정보를 넣을 수 있음.
        socket['nickname'] = message.payload;
        break;
    }
  });
});

server.listen(3000, handleListen);
