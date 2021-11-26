//http는 nodejs에 내장되어있음.
import http from 'http';
import { Server } from 'socket.io';
//백엔드를 위한 admin ui
import { instrument } from '@socket.io/admin-ui';
import express from 'express';
const app = express();

app.set('view engine', 'pug');
app.set('views', __dirname + '/views');
// static은 유저가 볼 수 있는 폴더를 지정하는거.
app.use('/public', express.static(__dirname + '/public'));

app.get('/', (_, res) => res.render('home'));
app.get('/*', (_, res) => res.redirect('/'));

const httpServer = http.createServer(app);
const wsServer = new Server(httpServer, {
  cors: {
    origin: ['https://admin.socket.io'],
    credentials: true,
  },
});

instrument(wsServer, {
  auth: false,
});

function publicRooms() {
  const {
    sockets: {
      // apater는 다른 서버들 사이에 실시간 어플리케이션을 동기화
      adapter: { sids, rooms },
    },
  } = wsServer;
  const publicRooms = [];
  rooms.forEach((_, key) => {
    // room id를 socket id에서 찾을 수 없다면 public room
    if (sids.get(key) === undefined) {
      publicRooms.push(key);
    }
  });
  return publicRooms;
}

function countRoom(roomName) {
  return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}

wsServer.on('connection', (socket) => {
  socket['nickname'] = 'Anon';
  socket.onAny((event) => {
    console.log(`Socket Event: ${event}`);
  });
  socket.on('enter_room', (roomName, done) => {
    socket.join(roomName);
    //done은 프론트에서 마지막 인수를 뜻함.
    //done func 실행시키면 프론트엔드에서 func 실행
    done();
    socket.to(roomName).emit('welcome', socket.nickname, countRoom(roomName));
    // message를 연결된 모든 socket에게 보내줌
    wsServer.sockets.emit('room_change', publicRooms());
  });
  //disconnecting은 원래 있는 이벤트이름.
  //sokcet이 방을 떠나기 바로 직전에 발생.
  socket.on('disconnecting', () => {
    //프론트에 emit
    socket.rooms.forEach((room) =>
      socket.to(room).emit('bye', socket.nickname, countRoom(room) - 1)
    );
  });
  socket.on('disconnect', () => {
    wsServer.sockets.emit('room_change', publicRooms());
  });
  // 프론트와 백엔드의 이벤트 이름이 같아도 상관없음.
  socket.on('new_message', (msg, room, done) => {
    socket.to(room).emit('new_message', `${socket.nickname}: ${msg}`);
    done();
  });
  socket.on('nickname', (nickname) => (socket['nickname'] = nickname));
});

const handleListen = () => console.log(`Listening on http://localhost:3000`);
httpServer.listen(3000, handleListen);
