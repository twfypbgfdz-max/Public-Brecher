const API_URL = "https://script.google.com/macros/s/AKfycbyodbqXL6wwIHU5Z18gvRDLi3GfbbVKYqbjL6r0NiR3jdupobFs2Yo4_etyydg0gYw3kQ/exec";

// Prüft, ob ein Name gespeichert ist, sonst Standard "ZYKLUS MASTER"
let SHEET_NAME = localStorage.getItem('meinPlanName') || "ZYKLUS MASTER";

// Funktion für deine Kumpels, um ihren eigenen Plan einzustellen
function setupPlan() {
    const name = prompt("Wie heißt dein Tab im Google Sheet exakt?", SHEET_NAME);
    if (name && name.trim() !== "") {
        localStorage.setItem('meinPlanName', name.trim());
        location.reload(); // Lädt die App mit dem neuen Plan neu
    }
}
const SHEET_NAME = "ZYKLUS MASTER";

async function loadPlan() {
    const list = document.getElementById('exercise-list');
    try {
        const resp = await fetch(`${API_URL}?sheet=${encodeURIComponent(SHEET_NAME)}&nocache=${Date.now()}`);
        const rows = await resp.json();
        
        list.innerHTML = "";
        rows.slice(3).forEach((row, index) => {
            if (!row[4]) return; // Name in Spalte E
            
            const card = document.createElement('div');
            card.className = 'exercise-card';
            card.innerHTML = `
                <div style="display:flex; justify-content:space-between">
                    <span class="exercise-title">${row[4]}</span>
                    <small style="color:#00bcd4">${row[5] || ''}</small> 
                </div>
                <div class="input-row">
                    <input type="number" step="0.5" placeholder="kg" id="kg-${index}" value="${row[2] || ''}">
                    <input type="number" placeholder="Reps" id="reps-${index}">
                    <button class="save-btn" id="btn-${index}" onclick="saveData(${index}, '${row[4]}')">Sichern</button>
                </div>
            `;
            list.appendChild(card);
        });
    } catch (e) { list.innerHTML = "Fehler beim Laden!"; }
}

async function saveData(id, uebung) {
    const btn = document.getElementById(`btn-${id}`);
    const kg = document.getElementById(`kg-${id}`).value;
    const reps = document.getElementById(`reps-${id}`).value;
    
    btn.innerText = "...";
    
    const payload = {
        sheet: SHEET_NAME,
        date: new Date().toLocaleDateString('de-DE', {day:'2.digit', month:'2.digit'}) + ".",
        uebung: uebung,
        g1: kg, r1: reps
    };

    try {
        const resp = await fetch(API_URL, { method: 'POST', body: JSON.stringify(payload) });
        const res = await resp.json();
        if (res.success) {
            btn.innerText = "OK!";
            btn.style.background = "#00e676";
        } else {
            alert("Fehler beim Speichern!");
            btn.innerText = "Error";
        }
    } catch (e) { alert("Verbindung fehlgeschlagen"); }
}

loadPlan();
