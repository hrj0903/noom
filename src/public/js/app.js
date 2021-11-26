// io는 자동적으로 backend socket.io와 연결해주는 function
const socket = io();
const welcome = document.getElementById('welcome');
const nameForm = welcome.querySelector('#name');
const form = welcome.querySelector('#enter');
const room = document.getElementById('room');
room.hidden = true;

let roomName;

function addMessage(message) {
  const ul = room.querySelector('ul');
  const li = document.createElement('li');
  li.innerText = message;
  ul.appendChild(li);
}

function handleMessageSubmit(event) {
  event.preventDefault();
  const input = room.querySelector('#msg input');
  const value = input.value;
  //백엔드에 emit
  socket.emit('new_message', input.value, roomName, () => {
    addMessage(`You: ${value}`);
  });
  input.value = '';
}

function handleNicknameSubmit() {
  event.preventDefault();
  const input = welcome.querySelector('#name input');
  socket.emit('nickname', input.value);
}

function showRoom() {
  welcome.hidden = true;
  room.hidden = false;
  const h3 = room.querySelector('h3');
  h3.innerText = `Room ${roomName}`;
  const msgForm = room.querySelector('#msg');
  msgForm.addEventListener('submit', handleMessageSubmit);
}

function handleRoomSubmit(event) {
  event.preventDefault();
  const input = form.querySelector('input');
  // 첫번째 arg: event의 이름만들기.
  // 두번째 arg: 보내고 싶은 인수들
  // 인수에 여러개 넣어도 상관없음.ex) socket.emit('enter_room',a,b,c,d,e);
  // websocket과 달리 두번째 args를 json.stringfy안해줘도됨. socketio가 알아서 다 해줌.
  // 마지막 arg: 서버에서 호출하는 function.
  // 마지막 arg가 함수가 아니어도 상관없음.
  // 만약 끝낼 때 실행되는 function을 보내고 싶으면 마지막 자리에 넣어야 함
  socket.emit('enter_room', input.value, showRoom);
  roomName = input.value;
  input.value = '';
}
form.addEventListener('submit', handleRoomSubmit);
nameForm.addEventListener('submit', handleNicknameSubmit);

socket.on('welcome', (user, newCount) => {
  const h3 = room.querySelector('h3');
  h3.innerText = `Room ${roomName} (${newCount})`;
  addMessage(`${user} arrived!`);
});

socket.on('bye', (left, newCount) => {
  const h3 = room.querySelector('h3');
  h3.innerText = `Room ${roomName} (${newCount})`;
  addMessage(`${left} left ㅠㅠ`);
});

socket.on('new_message', addMessage);

socket.on('room_change', (rooms) => {
  const roomList = welcome.querySelector('ul');
  roomList.innerHTML = '';
  if (rooms.length === 0) {
    //if문에서의 return문은 호출한 함수를 종료시킴
    //break는 if를 종료
    return;
  }
  rooms.forEach((room) => {
    const li = document.createElement('li');
    li.innerText = room;
    roomList.append(li);
  });
});
