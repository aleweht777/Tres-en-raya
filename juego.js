const cells = document.querySelectorAll('.cell');
const statusText = document.getElementById('status');
const restartButton = document.getElementById('restart');
const scoreX = document.getElementById('score-x');
const scoreO = document.getElementById('score-o');
const scoreDraws = document.getElementById('score-draws');

let board = Array(9).fill('');
let currentPlayer = 'X';
let isGameActive = true;
let winsX = 0;
let winsO = 0;
let draws = 0;
let audioContext = null;

function ensureAudio() {
    if (!audioContext) {
        const AudioCtor = window.AudioContext || window.webkitAudioContext;
        if (AudioCtor) {
            audioContext = new AudioCtor();
        }
    }

    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume();
    }
}

function playTone(frequency, duration, type = 'square', volume = 0.04, delay = 0) {
    if (!audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = type;
    oscillator.frequency.value = frequency;

    gainNode.gain.setValueAtTime(0.0001, audioContext.currentTime + delay);
    gainNode.gain.exponentialRampToValueAtTime(volume, audioContext.currentTime + delay + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + delay + duration);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start(audioContext.currentTime + delay);
    oscillator.stop(audioContext.currentTime + delay + duration);
}

function playMoveSound() {
    ensureAudio();
    playTone(660, 0.08, 'square', 0.035);
    setTimeout(() => playTone(880, 0.08, 'square', 0.03), 60);
}

function playWinSound() {
    ensureAudio();
    playTone(523, 0.14, 'triangle', 0.05);
    setTimeout(() => playTone(659, 0.14, 'triangle', 0.05), 120);
    setTimeout(() => playTone(784, 0.18, 'triangle', 0.05), 240);
}

function playDrawSound() {
    ensureAudio();
    playTone(350, 0.10, 'sawtooth', 0.03);
    setTimeout(() => playTone(280, 0.10, 'sawtooth', 0.03), 90);
}

const winningCombos = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

function updateStatus(message) {
    statusText.textContent = message;
}

function refreshScoreboard() {
    scoreX.textContent = winsX;
    scoreO.textContent = winsO;
    scoreDraws.textContent = draws;
}

function checkWinner() {
    for (const combo of winningCombos) {
        const [a, b, c] = combo;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return combo;
        }
    }
    return null;
}

function handleCellClick(event) {
    ensureAudio();
    const clickedCell = event.target;
    const index = Number(clickedCell.dataset.index);

    if (board[index] || !isGameActive) {
        return;
    }

    board[index] = currentPlayer;
    clickedCell.classList.add(currentPlayer.toLowerCase());
    clickedCell.disabled = true;
    playMoveSound();

    const winningCombo = checkWinner();

    if (winningCombo) {
        isGameActive = false;
        if (currentPlayer === 'X') {
            winsX += 1;
        } else {
            winsO += 1;
        }
        refreshScoreboard();
        updateStatus(`¡Ganó ${currentPlayer}!`);
        playWinSound();
        return;
    }

    if (board.every(cell => cell !== '')) {
        isGameActive = false;
        draws += 1;
        refreshScoreboard();
        updateStatus('Empate. Inténtalo otra vez.');
        playDrawSound();
        return;
    }

    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    updateStatus(`Turno de ${currentPlayer}`);
}

function restartGame() {
    board = Array(9).fill('');
    currentPlayer = 'X';
    isGameActive = true;

    cells.forEach(cell => {
        cell.textContent = '';
        cell.disabled = false;
        cell.classList.remove('x', 'o');
    });

    updateStatus('Turno de X');
}

cells.forEach(cell => {
    cell.addEventListener('click', handleCellClick);
});

restartButton.addEventListener('click', restartGame);

refreshScoreboard();
