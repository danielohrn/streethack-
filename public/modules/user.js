import { Marker } from './googlemaps.js'; 

// User 
export default class User {

    constructor(username, id){
        this.name = username; 
        this.googleMapMarker = null; 
        this.id = id; 
        this.socket = null; 
        this.coords = {
            lat: 59.300198, 
            lng: 17.995423
        }
    }

    logon(socket){
        socket.emit('logon', this.id); 
    }

    upDateCoords(coords, map){
        console.log('[User.upDateCoords]: coords updated on user');  
        this.coords = coords;
        this.drawMarker(map); 
    }

    drawMarker(map){
        console.log('[User.drawMarker]: new marker rendered on user'); 
        this.clearMarker(); 
        this.googleMapMarker = new Marker({lat: this.coords.lat, lng: this.coords.lng}, map); 
    }

    clearMarker(){
        if(this.googleMapMarker) {
            this.googleMapMarker.marker.setMap(null); 
        }
    }
}