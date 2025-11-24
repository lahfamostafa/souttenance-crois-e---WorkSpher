let workers = JSON.parse(localStorage.getItem("workers")) || [];

const maxCapacity = {
    "Réception":2, "conférence":8, "serveurs":4, 
    "sécurité":3, "personnel":6, "archives":2
};
const autoriseRole = {
    "Réception":["Réceptionniste","Manager","Nettoyage"],
    "serveurs":["Technicien IT","Manager","Nettoyage"],
    "sécurité":["Agent de sécurité","Manager","Nettoyage"],
    "personnel":["Réceptionniste","Technicien IT","Agent de sécurité","Manager","Nettoyage"],
    "conférence":["Réceptionniste","Technicien IT","Agent de sécurité","Manager","Nettoyage","Autre"],
    "archives":["Réceptionniste","Technicien IT","Agent de sécurité","Manager","Autre"]
};

const modal = document.getElementById("modal");
const addWorkerBtn = document.getElementById("addWorker");
const closeModalBtn = document.getElementById("closeModal");
const addExperienceBtn = document.getElementById("addexperiences");
const cardExperienceContainer = document.getElementById("cardExperience");
const leftDiv = document.querySelector(".aaaa");
const profileModal = document.getElementById("profile");
const closeProfileBtn = document.getElementById("closeProfile");

const assignModal = document.getElementById("assignModal");
const availableWorkersDiv = document.getElementById("availableWorkers");
const roomNameSpan = document.getElementById("roomName");
let currentRoom = "";

function saveWorkers(){
    localStorage.setItem("workers", JSON.stringify(workers));
}

function isAuthorized(worker, roomName){
    return (autoriseRole[roomName] || []).includes(worker.role);
}

addWorkerBtn.addEventListener("click", () => modal.classList.add("show"));
closeModalBtn.addEventListener("click", () => modal.classList.remove("show"));
modal.addEventListener("click", e => { if(e.target===modal) modal.classList.remove("show"); });

addExperienceBtn.addEventListener("click", e => {
    e.preventDefault();
    const expDiv = document.createElement("div");
    expDiv.className = "experiencesContent";
    expDiv.innerHTML = `
        <div class="header-experience">
            <div><h4>Titre</h4><input class="input-field inExp" type="text" required></div>
            <div><h4>Du</h4><input class="input-field inDate1" type="date" required></div>
            <div><h4>Au</h4><input class="input-field inDate2" type="date" required></div>
        </div>
        <div class="annulbtn">
            <button class="supprimer" type="button">Supprimer</button>
        </div><br><hr>
    `;
    cardExperienceContainer.appendChild(expDiv);
});

cardExperienceContainer.addEventListener("click", e => {
    if(e.target.classList.contains("supprimer")){
        e.target.closest(".experiencesContent").remove();
    }
});

document.querySelector(".modal-form").addEventListener("submit", e=>{
    e.preventDefault();
    const name = document.getElementById('name').value;
    const role = document.getElementById('role').value;
    const img = document.getElementById('img').value;
    const email = document.getElementById('email').value;
    const tele = document.getElementById('tele').value;

    const newWorker = {
        id: Date.now(),
        name,
        role,
        img,
        email,
        tele,
        experiences: []
    };

    document.querySelectorAll('.experiencesContent').forEach(exp=>{
        newWorker.experiences.push({
            Exp: exp.querySelector('.inExp').value,
            du: exp.querySelector('.inDate1').value,
            au: exp.querySelector('.inDate2').value
        });
    });

    workers.push(newWorker);
    saveWorkers();
    modal.classList.remove("show");
    e.target.reset();
    afficheLeftPanel();
});

function afficheLeftPanel(){
    leftDiv.innerHTML = "";

    const availableWorkers= workers.filter(w=> !w.currentRoom);
    availableWorkers.forEach(w=>{
        const div = document.createElement("div");
        div.className = "staffcartLeft";
        div.innerHTML = `
            <div class="cartLeft">
                <div><img class="photo" src="${w.img}"></div>
                <div><strong>${w.name}</strong><p class="role">${w.role}</p></div>
            </div>
            <div><button class="voir" data-id="${w.id}">Voir</button></div>
        `;
        leftDiv.appendChild(div);
    });
    voirBtn()
}

function voirBtn(){
    document.querySelectorAll('.aaaa .voir').forEach(btn=>{
        btn.onclick =()=>{
            const id = parseInt(btn.dataset.id)
            const worker=workers.find(w=> w.id ===id);
            if(worker) openProfile(worker)
        }
    })
}

function openProfile(worker){
    document.getElementById('nameOut').textContent = worker.name;
    document.getElementById('roleOut').textContent = worker.role;
    document.getElementById('emailOut').textContent = worker.email;
    document.getElementById('teleOut').textContent = worker.tele;
    document.querySelector('.myPhoto').src = worker.img;
    document.getElementById('experienceOutPut').innerHTML = worker.experiences.length 
        ? worker.experiences.map(e=>` ● ${e.Exp} (${e.du} - ${e.au})`).join("<br>")
        : "Aucune expérience";
    profileModal.classList.add("show");
}

leftDiv.addEventListener("click", e => {
    if(e.target.classList.contains("voir")){
        const id = parseInt(e.target.dataset.id);
        const w = workers.find(w=>w.id===id);
        if(w) openProfile(w);
    }
});


closeProfileBtn.onclick = ()=> profileModal.classList.remove("show");
profileModal.onclick = e=>{ if(e.target===profileModal) profileModal.classList.remove("show"); }

function handleAddToZone(roomName){
    currentRoom = roomName;
    roomNameSpan.textContent = roomName;
    availableWorkersDiv.innerHTML = "";

    const availableWorkers = workers.filter(w=>isAuthorized(w, roomName) && !w.currentRoom);

    if(!availableWorkers.length){
        availableWorkersDiv.innerHTML = "<p>Aucun employé disponible pour cette salle.</p>";
        return;
    }

    availableWorkers.forEach(w=>{
        const div = document.createElement("div");
        div.className = "workerOption";
        div.innerHTML = `
            <input type="checkbox" id="worker-${w.id}" value="${w.id}">
            <label for="worker-${w.id}">${w.name} (${w.role})</label>
        `;
        availableWorkersDiv.appendChild(div);
    });

    assignModal.classList.add("show");
}

document.querySelectorAll('.article').forEach(article=>{
    article.addEventListener('click', e=>{
        if(!e.target.closest('.cardAffecte') && !e.target.classList.contains('voir')){
            handleAddToZone(article.getAttribute('data-zone'));
        }
    });
});

document.querySelector('.assignContent').addEventListener('click', e=> e.stopPropagation());
document.getElementById('assignBtn').addEventListener('click', ()=>{
    availableWorkersDiv.querySelectorAll('input[type="checkbox"]:checked').forEach(cb=>{
        const w = workers.find(w=>w.id===parseInt(cb.value));
        if(w) assignWorkerToRoom(w, currentRoom);
        afficheLeftPanel()
    });
    saveWorkers();
    assignModal.classList.remove("show");
    renderRooms();
});
document.getElementById('closeAssignModal').addEventListener('click', ()=>assignModal.classList.remove("show"));
assignModal.addEventListener('click', e=>{ if(e.target===assignModal) assignModal.classList.remove("show"); });

function createWorkerCard(worker){
    const div = document.createElement('div');
    div.className = "cardAffecte";
    div.dataset.id = worker.id;
    div.innerHTML = `
        <div class="cartLeft">
            <div><img class="photo" src="${worker.img}"></div>
            <div><strong>${worker.name}</strong><p class="role">${worker.role}</p></div>
        </div>
        <div class="ViewAnnuler">
            <button class="voir" data-id="${worker.id}">Voir</button>
            <button class="annule">✕</button>
        </div>
    `;
    div.querySelector('.voir').addEventListener('click', ()=> openProfile(worker));
    div.querySelector('.annule').addEventListener('click', ()=>{
        removeFromRoom(worker.id);
    });
    return div;
}

function assignWorkerToRoom(worker, roomName){
    const zone = document.querySelector(`[data-zone="${roomName}"] .affecté`);
    if(zone.querySelectorAll('.cardAffecte').length >= maxCapacity[roomName]){
        alert(`La salle "${roomName}" a atteint sa capacité maximale.`);
        return;
    }
    if(!isAuthorized(worker, roomName)){
        alert(`Le rôle "${worker.role}" n’est pas autorisé ici.`);
        return;
    }
    worker.currentRoom = roomName;
    zone.appendChild(createWorkerCard(worker));
}

function removeFromRoom(id){
    const worker = workers.find(w => w.id === id);
    if(!worker || !worker.currentRoom) return;

    const roomName = worker.currentRoom;
    const zone = document.querySelector(`[data-zone="${roomName}"] .affecté`);

    const card = zone.querySelector(`[data-id="${id}"]`);
    if(card) card.remove();

    worker.currentRoom = null;

    saveWorkers();
    afficheLeftPanel();
}

function renderRooms(){
    Object.keys(maxCapacity).forEach(room=>{
        const zone = document.querySelector(`[data-zone="${room}"] .affecté`);
        zone.innerHTML = "";
    });

    workers.filter(w => w.currentRoom)
    .forEach(w => {
        const zone = document.querySelector(`[data-zone="${w.currentRoom}"] .affecté`);
        zone.appendChild(createWorkerCard(w));
    });
}

afficheLeftPanel();
renderRooms();