
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const port = process.env.PORT || 3001;

app.use(express.static(__dirname + '/public'));

io.on('connect', socket => {
  console.log(`connect ${socket.id}`);

  socket.on('hello', (data) => {
    console.log("<= hello from " + data.name );
    console.log("=> hello to " + data.name );
    socket.emit('hello', {
      hello: 'hello'
    });
  });

  socket.on('bye', () => {
    console.log("<= bye because " + data.reason);
    console.log("=> bye ack because of " + data.reason);
    socket.emit('bye', {
      bye: 'bye'
    });
  });

  socket.on('disconnect', () => {
    console.log(`disconnect ${socket.id}`);
  });
});

server.listen(port, () => console.log(`server listening on port ${port}`));
