import { Map, Marker } from './modules/googlemaps.js'; 
import { ui } from './ui/ui.js'; 
import User from './modules/user.js'; 
import initGeolocation from './modules/geolocation.js'; 

// Game 'controller'
const game = {
    /*  When a user connects 
     these are updated to reflect 
     the server side object */  
    questPositions: null, 
    questMarkers: {},
    socket: null,  

    // Inits all socket events
    initEvents(socket){
        this.socket = socket; 
        socket.on('init-quest-positions', this.onInitQuestPositions.bind(this));
        socket.on('start-quest', this.onPlayerStartedQuest.bind(this)); 
        socket.on('quest-ended', this.onQuestEnd.bind(this));   
        socket.on('cooldown-ended', this.onCoolDownEnd.bind(this)); 
        console.log('[game.initEvents]: socket events initialized')
    },

    // When quest positions are received from node
    // renders quest list and inits eventlisteners 
    onInitQuestPositions(positions){
        this.questPositions = positions; 
        ui.render('questlist', positions);
        this.renderQuestMarkers(); 
        ui.initDOMListeners(user, this.questPositions, this.startQuest.bind(this));
        console.log('[game.onInitQuestPositions]: questpositions initialized') 
    },

    // When a player starts a quest, receives updated questpostion from node
    onPlayerStartedQuest(startedQuest, id){
        this.questPositions[id] = startedQuest;
        this.questMarkers[id].reRender(Map.googleMap, './img/hacker.png');
        console.log('[game.onPlayerStartedQuest]: player started quest, marker was changed')  
    },

    // Requests quest postions from node
    requestQuestPositions(socket){
        socket.emit('init-quest-positons');
        console.log('[game.requestQuestPositions]: questpostions requested from client')   
    },

    // Renders all quest markers when user logs in 
    renderQuestMarkers(){
        for(let id in this.questPositions) {
            const newQuestMarker = new Marker({
                lat: this.questPositions[id].lat, 
                lng: this.questPositions[id].lng
            }, Map.googleMap, './img/change.png'); 

            newQuestMarker.id = id;
            // Adds listeners to all markers 
            newQuestMarker.marker.addListener('click', ()=>{
                ui.render('quest-dialog', this.questPositions[id], id);  
            })
            this.questMarkers[id] = newQuestMarker; 
        }
        console.log('[game.renderQuestMarkers]: questpositions received and questmarkers rendered')   
    }, 

    // When quest is started checks if quest is available 
    startQuest(questId){
        if(this.playerInRange.call(this, this.questMarkers[questId])) 
        {
            if(this.questPositions[questId].isAvailable) {
                console.log('[game.startQuest]: quest started', questId)
                this.socket.emit('start-quest', questId);
            } else {
                console.log('[game.startQuest]: quest not avail', questId); 
            }
        } 
        else 
        {
            console.log('[game.startQuest]: player was not in range to start quest', questId)
        }

    }, 

    // When quest ends, updates marker 
    onQuestEnd(questId){
        this.questPositions[questId].isBeingTaken = false; 
        this.questMarkers[questId].reRender(Map.googleMap, './img/blue.png'); 
        console.log('[game.onQuestEnd]: quest ended, cooldown started and marker changed...', questId); 
    },

    // When quest cooldown ends, updates marker 
    onCoolDownEnd(questId){
        this.questPositions[questId].isAvailable = true; 
        this.questMarkers[questId].reRender(Map.googleMap, './img/change.png');
        this.questMarkers[questId].addClickEvent(()=>{
            ui.render('quest-dialog', this.questPositions[questId], questId);  
        }); 
        console.log('[game.onCoolDownEnd]: cooldown ended quest is now avail, marker changed', questId)
    },

    // Checks if player is in range of a questposition
    playerInRange(questPosition){
        const range = 0.0011;
        const inLat =  questPosition.coords.lat;
        const inLng = questPosition.coords.lng;
        if(
            user.coords.lat < inLat + range && 
            user.coords.lat > inLat - range && 
            user.coords.lng < inLng + range && 
            user.coords.lng > inLng - range
        )
        {
        console.log('[game.playerInRange]: true'); 
          return true;
        }
        else
        {
        console.log('[game.playerInRange]: false'); 
          return false;
        }
    }
}

/* TESTING */ 
const mockUsers = [
    {username: 'Daniel', id: 1337}, 
    {username: 'Robbin', id: 1338}, 
    {username: 'Simon', id: 1339},
    {username: 'Alexander', id: 1340}, 
    {username: 'Björn', id: 1341}, 
    {username: 'Vladimir Putin', id: 1342}
] 
function getRandomMockUser(){
    return mockUsers[Math.floor(Math.random() * mockUsers.length)]; 
}
const mockUser = getRandomMockUser(); 
/* TESTING */ 


// Socket, user, geolocation and map initialized 
const socket = io(); 

const user = new User(mockUser.username, mockUser.id); 
user.logon(socket);

game.initEvents(socket); 
game.requestQuestPositions(socket); 

initGeolocation(user, Map); 








