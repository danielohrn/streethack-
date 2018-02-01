const socket = require('socket.io'); 
const positions = require('./positions.js');
const events = require('./events.js');

function initSocket(server){
    const io = socket(); 
    io.listen(server);

    // Inits connection to socket io
    initConnectionAndEvents(io); 

    return io; 
}

function initConnectionAndEvents(io){
    io.on('connection', (socket) => {
        console.log('[initConnectionAndEvents]: socket', socket.id, 'connected'); 
        
        // Inits all socket events
        events.logon(socket);
        events.onDisconnect(socket); 
 
        events.onInitQuestPositions(socket); 
        events.onBeginQuest(socket, io);

    });
}

// Exports 
module.exports = {
    initSocket,
    initConnectionAndEvents
}