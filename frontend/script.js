// Determine the API base URL.
// 1. If hosted on localhost/127.0.0.1 (Express local dev) or on Netlify (*.netlify.app), use relative path ('' / local serverless functions).
// 2. Otherwise (Surge or local file), fallback to http://localhost:5000.
const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.endsWith('netlify.app')) ? '' : 'http://localhost:5000';

// Local Core App State Log
let currentProfile = null;
let conversationThread = [];

// Scroll Reveal Engine
const observerOptions = { threshold: 0.1, rootMargin: "0px 0px -50px 0px" };
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, observerOptions);

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// DOM Containers
const formElement = document.getElementById('futureForm');
const submitBtn = document.getElementById('submitBtn');
const loadingElement = document.getElementById('engineLoading');
const loadingText = document.getElementById('loadingText');
const resultElement = document.getElementById('engineResult');
const chatSection = document.getElementById('chat');
const chatPill = document.getElementById('chatPill');
const chatLockedState = document.getElementById('chatLockedState');
const chatUnlockedState = document.getElementById('chatUnlockedState');
const errorBanner = document.getElementById('errorBanner');

// Target Result Layout Elements
const outputManifesto = document.getElementById('outputManifesto');
const outputIdentity = document.getElementById('outputIdentity');
const outputMoves = document.getElementById('outputMoves');
const outputHabit = document.getElementById('outputHabit');
const outputWarning = document.getElementById('outputWarning');
const outputMantra = document.getElementById('outputMantra');

// Messenger Dynamic Elements
const chatMessagesContainer = document.getElementById('chatMessages');
const chatInputForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const chatToneDisplay = document.getElementById('chatToneDisplay');

const loadingPhrases = [
    "Isolating present performance constraints...",
    "Calculating delta vectors for 1-year horizon...",
    "Synthesizing persona framework architecture..."
];

// Custom Toast Alerts System
function showToast(message) {
    const toast = document.getElementById('shareToast');
    const toastText = document.getElementById('toastText');
    if (toastText) {
        toastText.innerText = message;
    }
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Staged Loading Text Looper Engine
let loadingInterval;
function startLoadingSequence() {
    let index = 0;
    loadingText.innerText = loadingPhrases[0];
    loadingInterval = setInterval(() => {
        index = (index + 1) % loadingPhrases.length;
        loadingText.innerText = loadingPhrases[index];
    }, 1400);
}
function stopLoadingSequence() {
    clearInterval(loadingInterval);
}

// Profile Generation Submit Call
async function generateFutureMe(event) {
    event.preventDefault();
    
    const name = document.getElementById('userName').value.trim();
    const age = document.getElementById('userAge').value.trim();
    const goal = document.getElementById('userGoal').value.trim();
    const struggle = document.getElementById('userStruggle').value.trim();
    const timeline = document.getElementById('userTimeline').value.trim();
    const tone = document.getElementById('userTone').value;

    if (!name || !age || !goal || !struggle || !timeline || !tone) {
        errorBanner.style.display = 'flex';
        return;
    }
    errorBanner.style.display = 'none';

    // Rate Protection blocker
    submitBtn.disabled = true;
    formElement.style.opacity = '0.3';
    formElement.style.pointerEvents = 'none';

    // Transition State Layers
    loadingElement.style.display = 'block';
    resultElement.style.display = 'none';
    chatSection.style.display = 'none';
    startLoadingSequence();

    currentProfile = {
        name,
        age,
        goal,
        struggle,
        oneYearVision: timeline,
        tone
    };

    try {
        const response = await fetch(`${API_BASE}/api/generate-futureme`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(currentProfile)
        });

        const result = await response.json();

        if (response.ok && result.success) {
            populateManifestScreen(result.data);
        } else {
            throw new Error(result.error || "Failed to establish timeline sync.");
        }
    } catch (error) {
        console.error(error);
        showToast("FutureMe could not respond right now. Try again.");
        returnToFormState();
    } finally {
        stopLoadingSequence();
        submitBtn.disabled = false;
        formElement.style.opacity = '1';
        formElement.style.pointerEvents = 'all';
    }
}

// Populate & Render Dashboard Manifest
function populateManifestScreen(data) {
    outputManifesto.innerText = `"${data.message}"`;
    outputIdentity.innerText = data.futureIdentity;
    outputHabit.innerText = data.habit;
    outputWarning.innerText = data.warning;
    outputMantra.innerText = data.mantra;

    // Reset list and map execution items
    outputMoves.innerHTML = '';
    data.nextMoves.forEach(move => {
        const li = document.createElement('li');
        li.innerText = move;
        outputMoves.appendChild(li);
    });

    // Tear-down previous chat sessions to maintain context clarity
    conversationThread = [];
    chatMessagesContainer.innerHTML = '';
    
    // Update Chat Pill to show tone and unlock chat
    chatPill.innerHTML = `Direct Interface: Future Self (<span id="chatToneDisplay">${currentProfile.tone}</span>)`;

    chatLockedState.style.display = 'none';
    chatUnlockedState.style.display = 'flex';

    // Append greeting speech from FutureMe
    injectChatBubble('bubble-future', `Listen closely, ${currentProfile.name}. I am your future self speaking. The vision we wrote down has been actualized because you chose to pivot. Let's use this channel to address what we need to execute right now.`);

    // Screen Swapping Actions
    loadingElement.style.display = 'none';
    resultElement.style.display = 'block';
    
    setTimeout(() => {
        chatSection.classList.add('active');
        resultElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
}

function returnToFormState() {
    loadingElement.style.display = 'none';
    resultElement.style.display = 'none';
    formElement.style.display = 'block';
    
    // Lock chat again
    chatPill.innerText = 'Real-time Interface Preview';
    chatUnlockedState.style.display = 'none';
    chatLockedState.style.display = 'flex';
}

// Conversation Input Pipeline Execution
async function sendChatMessage(event) {
    event.preventDefault();
    if (!currentProfile) return;

    const query = chatInput.value.trim();
    if (!query) return;

    const sendBtn = document.getElementById('chatSendBtn');

    // Direct render on frontend message frame
    injectChatBubble('bubble-user', query);
    chatInput.value = '';

    // Disable forms during query
    chatInput.disabled = true;
    sendBtn.disabled = true;

    // Append to local memory arrays
    conversationThread.push({ role: 'user', message: query });

    // Inject temporary custom typing framework node
    const workingIndicator = injectTypingIndicator();

    try {
        const response = await fetch(`${API_BASE}/api/chat-futureme`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userProfile: currentProfile,
                chatHistory: conversationThread.slice(0, -1), // skip current input context
                question: query
            })
        });

        const result = await response.json();
        workingIndicator.remove();

        if (response.ok && result.success) {
            injectChatBubble('bubble-future', result.reply);
            conversationThread.push({ role: 'futureme', message: result.reply });
        } else {
            throw new Error(result.error || "Timeline link failed.");
        }
    } catch (error) {
        console.error(error);
        workingIndicator.remove();
        injectChatBubble('bubble-error', 'FutureMe link disrupted. Attempt transmission retry.');
    } finally {
        chatInput.disabled = false;
        sendBtn.disabled = false;
        chatInput.focus();
    }
}

function injectChatBubble(role, text) {
    const box = document.createElement('div');
    box.className = `chat-bubble ${role}`;
    
    // Format text lines into paragraph breaks inside the chat bubble
    const paragraphs = text.split('\n').filter(p => p.trim());
    if (paragraphs.length > 1) {
        paragraphs.forEach(p => {
            const pElem = document.createElement('p');
            pElem.style.marginBottom = '0.5rem';
            pElem.innerText = p;
            box.appendChild(pElem);
        });
    } else {
        box.innerText = text;
    }

    chatMessagesContainer.appendChild(box);
    chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
    return box;
}

function injectTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'chat-bubble bubble-future typing-indicator';
    indicator.innerHTML = `
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
    `;
    chatMessagesContainer.appendChild(indicator);
    chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
    return indicator;
}

// Clipboard Action Logic
function copyResult() {
    if (!currentProfile) return;

    const manifesto = outputManifesto.innerText;
    const identity = outputIdentity.innerText;
    const habit = outputHabit.innerText;
    const warning = outputWarning.innerText;
    const mantra = outputMantra.innerText;
    
    const movesList = [];
    document.querySelectorAll('#outputMoves li').forEach(li => movesList.push(li.innerText));

    const copyText = `✨ TRANSMISSION FROM MY FUTURE SELF ✨
-----------------------------------------
${manifesto}

👤 FUTURE IDENTITY:
${identity}

⚡ NEXT 3 OPERATIONAL MOVES:
1. ${movesList[0] || ""}
2. ${movesList[1] || ""}
3. ${movesList[2] || ""}

🌱 COMPLEMENTARY HABIT:
${habit}

⚠️ FUTURE WARNING:
${warning}

🧘 DAILY MANTRA:
"${mantra}"

- Generated via FutureMe (Prasanna's Founder Labs)`;

    navigator.clipboard.writeText(copyText)
        .then(() => {
            showToast("FutureMe profile copied securely.");
        })
        .catch(err => {
            console.error("Could not copy:", err);
            showToast("Clipboard copy failed.");
        });
}

// UI Navigation Actions
function regenerateIdentity() {
    formElement.reset();
    returnToFormState();
    setTimeout(() => {
        document.getElementById('userName').focus();
    }, 400);
}

function scrollToChat(event) {
    event.preventDefault();
    chatSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => {
        chatInput.focus();
    }, 600);
}

function triggerShare() {
    copyResult();
}

function scrollToForm(event) {
    if (event) event.preventDefault();
    document.getElementById('create').scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => {
        document.getElementById('userName').focus();
    }, 600);
}

// Custom Galaxy Password Gate Controller
function checkSiteAccess() {
    const isUnlocked = localStorage.getItem('site_unlocked') === 'true';
    const passwordGate = document.getElementById('passwordGate');
    
    if (isUnlocked) {
        if (passwordGate) {
            passwordGate.style.display = 'none';
        }
    } else {
        if (passwordGate) {
            passwordGate.style.display = 'flex';
            setTimeout(() => {
                const passInput = document.getElementById('gatePassword');
                if (passInput) passInput.focus();
            }, 300);
        }
    }
}

function unlockSite(event) {
    event.preventDefault();
    const enteredPassword = document.getElementById('gatePassword').value.trim();
    const gateError = document.getElementById('gateError');
    const passwordGate = document.getElementById('passwordGate');
    
    // Accept netlify site password (My-Drop-Site), mydropsite, or 'galaxy' / 'prasanna' as backups
    const validPasswords = ['my-drop-site', 'mydropsite', 'prasanna', 'galaxy'];
    
    if (validPasswords.includes(enteredPassword.toLowerCase())) {
        localStorage.setItem('site_unlocked', 'true');
        
        // Trigger smooth galaxy slide fade out
        if (passwordGate) {
            passwordGate.classList.add('hidden');
            setTimeout(() => {
                passwordGate.style.display = 'none';
            }, 800);
        }
    } else {
        if (gateError) {
            gateError.style.display = 'block';
            setTimeout(() => {
                gateError.style.display = 'none';
            }, 3000);
        }
    }
}

// Make functions globally accessible for inline forms
window.unlockSite = unlockSite;

// Perform immediate security gate check on load
checkSiteAccess();
