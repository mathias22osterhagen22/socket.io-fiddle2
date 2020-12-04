
const socketio = require('socket.io-client');
const { execSync } = require('child_process');

const NBR_POSSIBILITES_TO_ECHO = 1000000; //NOTE: Change this to adapt the cmd script to perform his task in at least 60 sec

class MsgQueue {
  constructor(socket) {
    this.socket = socket;
    this.queue = [];
  }

  addToQueue(road, payload, callback) {
    this.queue.push({ road: road, payload: payload, callback: callback });
  }

  emitQueue() {
    let queueCpy = this.queue.map(q => q); //avoid to foreach on it while element can be added in the same time
    for (var element of queueCpy) {
      console.log("-remove listener: " + element.road);
      this.socket.off(element.road);
      console.log("-add listener: " + element.road);
      this.socket.on(element.road, (data) => {
        console.log("-rcv from: " + element.road);
        this.queue.splice(this.queue.indexOf(element), 1); //remove from queue
        element.callback(data);
      });
      console.log("-emit: " + element.road);
      this.socket.emit(element.road, element.payload);
    }
  }
};

function connectSocket() {
  return new Promise((resolve, reject) => {
    let socket = socketio('http://localhost:3001');
    socket.on('connect', () => {
      console.log(`===== connected ${socket.id}`);
      resolve(socket);
    });
    socket.on('disconnect', () => {
      console.log(` ==/==disconnect ${socket.id}`);
    });
  });
}

function sayHello(msgQueue) {
  return new Promise((resolve, reject) => {
    msgQueue.addToQueue("hello", { name: "Sonic" }, (data) => {
      console.log("<= hello: " + data.hello);
      resolve(data);
    });
    msgQueue.emitQueue();
  });
}

function sayBye(msgQueue) {
  return new Promise((resolve, reject) => {
    msgQueue.addToQueue("bye", { reason: "to fast 4 u" }, (data) => {
      console.log("<= bye: " + data.bye);
      resolve(data);
    });
    msgQueue.emitQueue();
  });
}

(async () => {
  let socket = await connectSocket();
  let msgQueue = new MsgQueue(socket);
  sayHello(msgQueue);
  sayBye(msgQueue);
})();
