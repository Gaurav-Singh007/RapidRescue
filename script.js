// Initialize Lucide icons
lucide.createIcons();

// DOM Elements
const sosBtn = document.getElementById('sos-btn');
const ring1 = document.getElementById('radar-ring-1');
const ring2 = document.getElementById('radar-ring-2');
const actionResult = document.getElementById('action-result');
const statusText = document.getElementById('status-text');

let isAlarmActive = false;
let holdTimer = null;

// AI Chat Elements
const aiHelpBtn = document.getElementById('ai-help-btn');
const aiChatOverlay = document.getElementById('ai-chat-overlay');
const closeChatBtn = document.getElementById('close-chat-btn');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const chatMessages = document.getElementById('chat-messages');

// --- SOS Button Logic ---
function activateAlarm() {
    if (isAlarmActive) return;
    isAlarmActive = true;

    // Change button appearance
    sosBtn.classList.remove('animate-pulse-glow', 'from-red-500', 'to-red-700');
    sosBtn.classList.add('bg-red-900', 'border-red-500/80', 'scale-95');
    sosBtn.innerHTML = `
        <i data-lucide="check-circle" class="w-12 h-12 mb-1 text-green-400"></i>
        <span class="text-2xl font-black tracking-widest text-white">DISPATCHED</span>
    `;
    lucide.createIcons(); // Re-initialize new icon

    // Activate radar rings
    ring1.classList.add('radar-active');
    ring2.classList.add('radar-active-delayed');

    // Update status
    statusText.style.opacity = '0';
    setTimeout(() => {
        statusText.innerHTML = `
            <span class="text-gray-400 text-sm font-medium uppercase tracking-widest mb-2">System Status</span>
            <span class="px-4 py-1.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 font-bold flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                Emergency Active
            </span>
        `;
        statusText.style.opacity = '1';
    }, 300);

    // Show result text
    actionResult.classList.remove('opacity-0');
    actionResult.classList.add('opacity-100');

    // Simulate finding ambulances
    let searchRadius = 0;
    let foundAmbulances = 0;
    const searchInterval = setInterval(() => {
        searchRadius += 1; // Increment by 1km each tick
        const foundNow = Math.floor(Math.random() * 4); // Find 0-3 ambulances per km
        if(searchRadius >= 1) foundAmbulances += foundNow;

        // Randomly "find" ambulances after a few seconds
        if (searchRadius >= 10) {
            clearInterval(searchInterval);
            actionResult.innerHTML = `
                <p class="text-xl font-bold text-green-400 mb-1">Alert Broadcasted!</p>
                <p class="text-sm text-gray-300">Message sent to ${foundAmbulances} ambulances within a 1km to 10km radius.</p>
            `;

            // Add a follow-up message to the AI chat to offer help
            setTimeout(() => {
                addAiMessage(`I see you've triggered an emergency. I have broadcasted your signal to ${foundAmbulances} ambulances within a 10km radius. Please stay calm and make sure you're in a safe location. Do you need any first-aid instructions?`);
            }, 2000);
        } else {
            actionResult.innerHTML = `
                <p class="text-lg font-bold text-primary mb-1">Scanning Radius: ${searchRadius}km</p>
                <p class="text-sm text-slate-300">Found ${foundAmbulances} ambulances so far...</p>
            `;
        }
    }, 600);
}

// Support click or hold
sosBtn.addEventListener('mousedown', () => {
    holdTimer = setTimeout(activateAlarm, 400); // Activate after holding for 400ms
});
sosBtn.addEventListener('mouseup', () => clearTimeout(holdTimer));
sosBtn.addEventListener('mouseleave', () => clearTimeout(holdTimer));

// Fallback for touch devices
sosBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    holdTimer = setTimeout(activateAlarm, 400);
});
sosBtn.addEventListener('touchend', (e) => {
    e.preventDefault();
    clearTimeout(holdTimer);
});
sosBtn.addEventListener('click', () => {
    if(!isAlarmActive) activateAlarm(); // Immediate activation on simple click as well for urgency
});


// --- AI Chat Logic ---

aiHelpBtn.addEventListener('click', () => {
    aiChatOverlay.classList.remove('translate-x-full');
});

closeChatBtn.addEventListener('click', () => {
    aiChatOverlay.classList.add('translate-x-full');
});

function addAiMessage(text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = "flex items-start gap-3 w-[90%]";
    msgDiv.innerHTML = `
                < div class="bg-gradient-to-br from-surface to-slate-800 rounded-2xl rounded-tl-sm p-4 text-sm text-slate-200 shadow-lg border border-white/5 leading-relaxed whitespace-pre-wrap" >
                    ${ text }
        </div >
        `;
    chatMessages.appendChild(msgDiv);
    lucide.createIcons();
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addUserMessage(text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = "flex items-start justify-end gap-3 w-full ml-auto";
    msgDiv.innerHTML = `
        < div class="bg-blue-600 rounded-2xl rounded-tr-sm p-4 text-sm text-white shadow-lg shadow-blue-500/20 max-w-[85%]" >
            ${ text }
        </div >
        `;
    chatMessages.appendChild(msgDiv);
    lucide.createIcons();
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

const aiKnowledgeBase = [
    { keywords: ['hello', 'hi', 'hey'], response: "Hello! I am here 24/7. In case of a medical emergency, just tap the big red SOS button." },
    { keywords: ['how', 'use', 'work'], response: "Simply press and hold the central SOS button on the home screen. It will instantly broadcast your location to all nearby ambulances." },
    { keywords: ['who', 'ceo', 'creator', 'gaurav'], response: "This application was built and is led by CEO Gaurav Kumar. We are dedicated to providing rapid medical assistance globally." },
    { keywords: ['cost', 'price', 'fee'], response: "The SOS dispatch service is currently provided free of charge for users to ensure rapid medical assistance." },
    { keywords: ['cancel', 'accident', 'mistake'], response: "If you pressed the button by mistake, ambulances are already dispatched. You cannot cancel from the app to prevent bad actors. Please call the emergency dispatch center immediately to abort." },
    { keywords: ['first aid', 'bleeding', 'cpr', 'help'], response: "If someone is bleeding, apply firm pressure to the wound with a clean cloth. If they stopped breathing, start CPR by pushing hard and fast in the center of their chest. An ambulance is on the way if you pressed SOS." }
];

chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if(!text) return;
    
    addUserMessage(text);
    chatInput.value = '';
    
    // Simulate AI thinking
    setTimeout(() => {
        const lowerText = text.toLowerCase();
        let matchFound = false;
        
        for(let kb of aiKnowledgeBase) {
            if(kb.keywords.some(kw => lowerText.includes(kw))) {
                addAiMessage(kb.response);
                matchFound = true;
                break;
            }
        }
        
        if(!matchFound) {
            addAiMessage("I'm an AI assistant focused on the RapidRescue app. Please use the SOS button for emergencies. If you have specific medical questions, wait for the dispatched paramedics.");
        }
    }, 600 + Math.random() * 600); // 0.6s - 1.2s delay
});
