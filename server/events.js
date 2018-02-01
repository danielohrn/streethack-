const positions = require('./positions.js');
const Stopwatch = require('timer-stopwatch'); 

// Connected users 
const USERS = new Map();

// Events 
const events = {

    beginQuest(questId, socket){
        positions[questId].timer = new Stopwatch(5000, {refreshRateMS: 100});
        positions[questId].timer.start(); 
        console.log('[beginQuest]: quest started counting down 5 sec...', questId);
        
        this.onEndQuest.call(this, questId, socket);  
    },

    onEndQuest(questId, socket){
        positions[questId].timer.onDone(()=> {
            positions[questId].timer.stop(); 
            positions[questId].isBeingTaken = false;
            console.log('[onEndQuest]: quest ended after 5 sec, starting cooldown', questId, positions[questId].isBeingTaken); 
            socket.emit('quest-ended', questId); 
            this.coolDownQuest.call(this, questId, socket); 
        })
    },

    coolDownQuest(questId, socket){
        positions[questId].coolDown = new Stopwatch(5000, {refreshRateMS: 100}); 
        positions[questId].coolDown.start(); 
        positions[questId].coolDown.onDone(()=>{
            positions[questId].timer.stop(); 
            positions[questId].isAvailable = true; 
            console.log('[coolDownQuest]: cooldown stoped after 5 sec', questId, positions[questId].isAvailable);
            socket.emit('cooldown-ended', questId);  
        });
    },

    onInitQuestPositions(socket){
        socket.on('init-quest-positons', (user) => {
            socket.emit('init-quest-positions', positions);
        }); 
    }, 

    // When player begins quest 
    onBeginQuest(socket, io) {
        socket.on('start-quest', (questId) => {
            console.log('[coolDownQuest]: started quest:', questId); 
            
            // Toggles quest to unavailable 
            positions[questId].isAvailable = false; 
            positions[questId].isBeingTaken = true; 
            
            // Emits that quest was started to all sockets
            io.sockets.emit('start-quest', positions[questId], questId);
            
            // Starts quest and binds `this` to the events object 
            this.beginQuest.call(this, questId, socket); 
        })
    },

    // When a user connects, adds that user to the USERS-map
    logon(socket){
        socket.on('logon', (userId) => {
            console.log('[logon]: user loged on', userId);
            USERS.set(socket.id, {userId: userId});
            console.log('[logon]: connected users:', USERS);  
        })
    },

    // When a user disconnects, removes that user from the USERS-map
    onDisconnect(socket){
        socket.on('disconnect', (reason) => {
            if(USERS.get(socket.id)) {
                console.log('[onDisconnect]: user disconnected', USERS.get(socket.id)); 
                USERS.delete(socket.id); 
                console.log('[onDisconnect]: online users:', USERS); 
            }
        })
    }
}

// Exports 
module.exports = events;
