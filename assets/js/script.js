const keys = [
    { name: "C", signature: "No sharps or flats" },
    { name: "C# / D♭", signature: "7 sharps / 5 flats" },
    { name: "D", signature: "2 sharps" },
    { name: "D# / E♭", signature: "6 sharps / 3 flats" },
    { name: "E", signature: "4 sharps" },
    { name: "F", signature: "1 flat" },
    { name: "F# / G♭", signature: "6 sharps / 6 flats" },
    { name: "G", signature: "1 sharp" },
    { name: "G# / A♭", signature: "5 sharps / 4 flats" },
    { name: "A", signature: "3 sharps" },
    { name: "A# / B♭", signature: "5 sharps / 2 flats" },
    { name: "B", signature: "5 sharps" }
];

let generatedCount = 0;
let timerInterval = null;
let currentTime = 0;
let totalTime = 30;
let isTimerRunning = false;
let autoGenerate = false;

let elements = {};

function init() {

    elements = {
        timerMinutes: document.getElementById('timerMinutes'),
        timerSeconds: document.getElementById('timerSeconds'),
        timerDisplay: document.getElementById('timerDisplay'),
        timerSection: document.getElementById('timerSection'),
        startTimer: document.getElementById('startTimer'),
        stopTimer: document.getElementById('stopTimer'),
        resetTimer: document.getElementById('resetTimer'),
        timerStatus: document.getElementById('timerStatus'),
        generateBtn: document.getElementById('generateBtn'),
        displayArea: document.getElementById('displayArea'),
        keyName: document.getElementById('keyName'),
        keySignature: document.getElementById('keySignature'),
        generatedCount: document.getElementById('generatedCount'),
        totalKeys: document.getElementById('totalKeys')
    };

    currentTime = 30;
    totalTime = 30;
    updateTimerDisplay();
    updateStats();

    setupEventListeners();
}

function setupEventListeners() {

    elements.timerMinutes.addEventListener('input', handleTimerInputChange);
    elements.timerSeconds.addEventListener('input', handleTimerInputChange);

    document.addEventListener('keydown', handleKeyPress);

    document.addEventListener('keydown', preventSpaceScroll);
}

function handleTimerInputChange() {
    if (!isTimerRunning) {
        updateTotalTimeFromInputs();
        updateTimerDisplay();
    }
}

function handleKeyPress(event) {
    if (event.code === 'Space' && event.target === document.body) {
        event.preventDefault();
        generate();
    }
}

function preventSpaceScroll(event) {
    if (event.code === 'Space' && 
        ['BUTTON', 'SELECT', 'INPUT'].includes(event.target.tagName) &&
        event.target.tagName !== 'INPUT') {
        event.preventDefault();
        generate();
    }
}

function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function setPreset(minutes, seconds) {
    elements.timerMinutes.value = minutes;
    elements.timerSeconds.value = seconds;
    updateTotalTimeFromInputs();
    updateTimerDisplay();

    const presetButtons = document.querySelectorAll('.preset-btn');
    presetButtons.forEach(btn => {
        btn.style.transform = 'scale(0.95)';
        setTimeout(() => btn.style.transform = '', 150);
    });
}

function updateTotalTimeFromInputs() {
    const minutes = parseInt(elements.timerMinutes.value) || 0;
    const seconds = parseInt(elements.timerSeconds.value) || 0;

    totalTime = minutes * 60 + seconds;

    if (totalTime <= 0) {
        totalTime = 30;
        if (!elements.timerSeconds.value) {
            elements.timerSeconds.value = 30;
        }
    }

    if (!isTimerRunning) {
        currentTime = totalTime;
    }
}

function updateTimerDisplay() {
    const minutes = Math.floor(currentTime / 60);
    const seconds = currentTime % 60;
    const displayText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    elements.timerDisplay.textContent = displayText;

    const progress = totalTime > 0 ? ((totalTime - currentTime) / totalTime) * 100 : 0;
    elements.timerSection.style.setProperty('--progress', `${progress}%`);

    updateTimerWarningStates();
}

function updateTimerWarningStates() {

    elements.timerDisplay.classList.remove('warning', 'critical');
    elements.timerSection.classList.remove('warning', 'critical');

    if (isTimerRunning) {
        if (currentTime <= 5) {
            elements.timerDisplay.classList.add('critical');
            elements.timerSection.classList.add('critical');
        } else if (currentTime <= 15) {
            elements.timerDisplay.classList.add('warning');
            elements.timerSection.classList.add('warning');
        }
    }
}

function startTimer() {
    updateTotalTimeFromInputs();

    if (totalTime <= 0) {
        alert('Please set a valid timer duration.');
        return;
    }

    currentTime = totalTime;
    isTimerRunning = true;
    autoGenerate = true;

    elements.startTimer.disabled = true;
    elements.stopTimer.disabled = false;
    elements.timerStatus.textContent = 'Running';

    generate();

    timerInterval = setInterval(() => {
        currentTime--;
        updateTimerDisplay();

        if (currentTime <= 0) {

            generate();
            currentTime = totalTime;
        }
    }, 1000);

    updateTimerDisplay();
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    isTimerRunning = false;
    autoGenerate = false;

    elements.startTimer.disabled = false;
    elements.stopTimer.disabled = true;
    elements.timerStatus.textContent = 'Stopped';

    elements.timerDisplay.classList.remove('warning', 'critical');
    elements.timerSection.classList.remove('warning', 'critical');
}

function resetTimer() {
    stopTimer();

    updateTotalTimeFromInputs();
    currentTime = totalTime;

    elements.timerSection.style.setProperty('--progress', '0%');

    updateTimerDisplay();
    elements.timerStatus.textContent = 'Ready';
}

function generate() {
    const loadingDuration = isTimerRunning ? 100 : 300;

    elements.generateBtn.classList.add('loading');
    elements.generateBtn.textContent = '🎲 Generating...';

    setTimeout(() => {
        try {

            const randomKey = getRandomElement(keys);

            elements.keyName.textContent = randomKey.name;
            elements.keySignature.textContent = randomKey.signature;

            elements.displayArea.classList.add('animation');
            setTimeout(() => elements.displayArea.classList.remove('animation'), 600);

            generatedCount++;
            updateStats();

        } catch (error) {
            console.error('Error generating key:', error);
            elements.keyName.textContent = 'Error';
            elements.keySignature.textContent = 'Please try again';
        } finally {

            elements.generateBtn.classList.remove('loading');
            elements.generateBtn.textContent = '🎲 Generate Random Key';
        }
    }, loadingDuration);
}

function updateStats() {
    elements.totalKeys.textContent = keys.length;
    elements.generatedCount.textContent = generatedCount;
}

function addEntranceAnimation() {
    const container = document.querySelector('.container');
    if (container) {
        container.style.animation = 'displayPulse 0.6s ease-in-out';
    }
}

document.addEventListener('DOMContentLoaded', init);

window.addEventListener('load', addEntranceAnimation);

window.startTimer = startTimer;
window.stopTimer = stopTimer;
window.resetTimer = resetTimer;
window.generate = generate;
window.setPreset = setPreset;