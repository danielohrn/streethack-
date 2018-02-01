import { Map } from '../modules/googlemaps.js'; 

// DOM elements 
const menu = document.querySelector('#menu'), 
    questList = document.querySelector('#menu-list'),
    compass = document.querySelector('#compass'), 
    questDialog = document.querySelector('#quest-dialog');

// Inits all eventlisteners for the menu-UI 
const initDOMListeners = function(user, positions, startQuestCallback){
    
    // Shows the quest list 
    menu.addEventListener('click', function(){
        document.querySelector('#menu-list').classList.toggle('show'); 
    })

    // Centers the map on the user 
    compass.addEventListener('click', function(){
        Map.setZoom(user.coords.lat, user.coords.lng);  
    })

    // Centers map on clicked quest 
    questList.addEventListener('click', function(e){
        if(e.target.classList.contains('center-map')){
            const questId = e.target.parentNode.dataset.questid; 
            Map.setZoom(positions[questId].lat, positions[questId].lng);
            document.querySelector('#menu-list').classList.toggle('show'); 
        }
    })

    // Quest dialog events 
    questDialog.addEventListener('click', function(event) {
        
        // Starts quest 
        if(event.target.id == 'start-quest') {
            const questId = event.target.parentNode.parentNode.dataset.questid;
            questDialog.classList.remove("show"); 
            startQuestCallback(questId);  
        }

        // Closes quest dialog 
        if(event.target.id == 'cancel') {
            questDialog.classList.remove("show");
        }
    })
} 

// Renders all quests on logon
function renderQuestList(quests){
    for(let id in quests) {
        questList.querySelector('.menu-container ul')
            .innerHTML += `
            <li data-questid=${id}>
                <a href="#">
                    <i class="fa fa-money fa-2x"></i>
                    <span style="margin-left: 20px;">
                        ${quests[id].name.toUpperCase()}
                        (${quests[id].area.toUpperCase()})
                    </span>
                </a>
                <i class="center-map fa fa-compass fa-2x" aria-hidden="true"></i>
            </li> `;
    }
}

// Opens quest dialog and renders HTML
function renderQuestDialog(position, id){
    questDialog.classList.add("show");
    questDialog.dataset.questid = id; 
    questDialog.querySelector('#quest-dialog-name h4').innerHTML = position.name + `(${id})`; 
}

/*
** Renders something in the menu-UI 
** depending on the type that was sent in
** ...data = parameters that the render needs, for example questpostions */ 
function render(type, ...data){
    switch(type) {
        case 'questlist': 
            renderQuestList(...data); 
            break; 
        case 'quest-dialog': 
            renderQuestDialog(...data); 
            break; 
        default: 
            break; 
    }
}

const ui = {
    render,
    initDOMListeners
}

export { ui }; 
