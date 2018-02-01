// Inits geolocation 
export default function initGeolocation(user, map){
    navigator.geolocation.watchPosition(onUpdatePos, onPosError); 

    function onUpdatePos(pos){ 
        user.upDateCoords({lat: pos.coords.latitude, lng: pos.coords.longitude}, map.googleMap);
    }
    function onPosError(err){ console.log('Pos update error:', err) }
}