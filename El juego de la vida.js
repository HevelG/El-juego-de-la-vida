// Selección de elementos del DOM
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');
const resetButton = document.getElementById('resetButton');
const infoButton = document.getElementById('infoButton');
const popup = document.getElementById('popup');
const overlay = document.getElementById('overlay');

const dotBrushButton = document.getElementById('dotBrush');
const walkerBrushButton = document.getElementById('walkerBrush');
const boatBrushButton = document.getElementById('boatBrush');
const shipBrushButton = document.getElementById('shipBrush');
const bossBrushButton = document.getElementById('bossBrush');
const novaBrushButton = document.getElementById('novaBrush');

const dotCanvas = document.getElementById('dotCanvas');
const walkerCanvas = document.getElementById('walkerCanvas');
const boatCanvas = document.getElementById('boatCanvas');
const shipCanvas = document.getElementById('shipCanvas');
const bossCanvas = document.getElementById('bossCanvas');
const novaCanvas = document.getElementById('novaCanvas');

// Configuración del tamaño del canvas y la cuadrícula
const gridWidth = 140; // Número de celdas a lo ancho
const gridHeight = 70; // Número de celdas a lo alto
const cellSize = 6; // Tamaño de cada celda en píxeles
canvas.width = gridWidth * cellSize; // Ancho del canvas
canvas.height = gridHeight * cellSize; // Alto del canvas

// Refresca la pagina
const title = document.querySelector('h1');
title.addEventListener('click', () => {
    location.reload(); 
});

// Estado del juego
let grid = createGrid(gridWidth, gridHeight);
let running = false;
let interval;
let isMouseDown = false;
let currentBrush = 'dot';
let currentRotation = 0;

// Función para crear una cuadrícula vacía
function createGrid(width, height) {
    return new Array(height).fill(null).map(() => new Array(width).fill(0));
}

// Función para dibujar la cuadrícula en el canvas
function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let row = 0; row < gridHeight; row++) {
        for (let col = 0; col < gridWidth; col++) {
            ctx.beginPath();
            ctx.rect(col * cellSize, row * cellSize, cellSize, cellSize);
            ctx.fillStyle = grid[row][col] ? 'green' : 'black'; // Celdas vivas verdes, celdas muertas negras
            ctx.fill();
            ctx.strokeStyle = 'black'; // Contorno negro
            ctx.stroke();
        }
    }
}

// Función para obtener el estado de la célula en la próxima generación
function getNextState(grid, x, y) {
    const neighbors = [
        [0, 1], [1, 0], [1, 1], [0, -1], [-1, 0], [-1, -1], [-1, 1], [1, -1]
    ];
    let liveNeighbors = 0;

    neighbors.forEach(([dx, dy]) => {
        const newX = (x + dx + gridWidth) % gridWidth;
        const newY = (y + dy + gridHeight) % gridHeight;
        liveNeighbors += grid[newY][newX];
    });

    if (grid[y][x] === 1) {
        return liveNeighbors === 2 || liveNeighbors === 3 ? 1 : 0;
    } else {
        return liveNeighbors === 3 ? 1 : 0;
    }
}

// Función para calcular la próxima generación
function nextGeneration() {
    const newGrid = grid.map((row, y) => row.map((cell, x) => getNextState(grid, x, y)));
    grid = newGrid;
    drawGrid();
}

// Controladores de eventos para los botones
startButton.addEventListener('click', () => {
    if (!running) {
        running = true;
        interval = setInterval(nextGeneration, 100);
    }
});

stopButton.addEventListener('click', () => {
    running = false;
    clearInterval(interval);
});

resetButton.addEventListener('click', () => {
    running = false;
    clearInterval(interval);
    grid = createGrid(gridWidth, gridHeight);
    drawGrid();
});

infoButton.addEventListener('click', () => {
    popup.style.display = 'block';
    overlay.style.display = 'block';
});

overlay.addEventListener('click', () => {
    popup.style.display = 'none';
    overlay.style.display = 'none';
});

// Brush control event listeners
dotBrushButton.addEventListener('click', () => { currentBrush = 'dot'; });
walkerBrushButton.addEventListener('click', () => { rotateBrush('walker'); });
boatBrushButton.addEventListener('click', () => { rotateBrush('boat'); });
shipBrushButton.addEventListener('click', () => { rotateBrush('ship'); });
bossBrushButton.addEventListener('click', () => { rotateBrush('boss'); });
novaBrushButton.addEventListener('click', () => { rotateBrush('nova'); });

// Controladores de eventos para el canvas (activar/desactivar células)
canvas.addEventListener('mousedown', (event) => {
    isMouseDown = true;
    applyBrush(event);
});

canvas.addEventListener('mouseup', () => {
    isMouseDown = false;
});

canvas.addEventListener('mousemove', (event) => {
    if (isMouseDown) {
        applyBrush(event);
    } else {
        showGhostBrush(event);
    }
});

function applyBrush(event) {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / cellSize);
    const y = Math.floor((event.clientY - rect.top) / cellSize);

    const pattern = getCurrentBrushPattern();

    if (currentBrush === 'dot') {
        grid[y][x] = grid[y][x] ? 0 : 1; // Alterna el estado de la celda
    } else {
        const offsetX = Math.floor(pattern[0].length / 2);
        const offsetY = Math.floor(pattern.length / 2);

        for (let row = 0; row < pattern.length; row++) {
            for (let col = 0; col < pattern[row].length; col++) {
                const newX = (x + col - offsetX + gridWidth) % gridWidth;
                const newY = (y + row - offsetY + gridHeight) % gridHeight;
                grid[newY][newX] = pattern[row][col];
            }
        }
    }
    drawGrid();
}

function applyPattern(x, y, pattern) {
    const offsetX = Math.floor((11 - pattern[0].length) / 2);
    const offsetY = Math.floor((11 - pattern.length) / 2);

    for (let row = 0; row < pattern.length; row++) {
        for (let col = 0; col < pattern[row].length; col++) {
            const newX = (x + col + offsetX + gridWidth) % gridWidth;
            const newY = (y + row + offsetY + gridHeight) % gridHeight;
            grid[newY][newX] = pattern[row][col];
        }
    }
}

function rotatePattern(pattern, rotation) {
    let rotatedPattern = pattern;
    for (let i = 0; i < rotation; i++) {
        rotatedPattern = rotatedPattern[0].map((_, colIndex) =>
            rotatedPattern.map(row => row[colIndex]).reverse()
        );
    }
    return rotatedPattern;
}

function rotateBrush(brush) {
    if (currentBrush === brush) {
        currentRotation = (currentRotation + 1) % 4;
    } else {
        currentBrush = brush;
        currentRotation = 0;
    }
    updateBrushIcons();
}

function updateBrushIcons() {
    const brushes = {
        dot: [[1]],
        walker: rotatePattern([
            [0, 0, 0, 0, 0],
            [0, 0, 1, 0, 0],
            [0, 0, 0, 1, 0],
            [0, 1, 1, 1, 0],
            [0, 0, 0, 0, 0]
        ], currentRotation),
        boat: rotatePattern([
            [1, 0, 0, 1, 0],
            [0, 0, 0, 0, 1],
            [1, 0, 0, 0, 1],
            [0, 1, 1, 1, 1]
        ], currentRotation),
        ship: rotatePattern([
            [0, 0, 1, 0, 0, 0, 0, 0, 0],
            [1, 1, 0, 0, 0, 0, 0, 0, 0],
            [1, 0, 0, 1, 1, 1, 0, 0, 1],
            [1, 0, 0, 0, 0, 1, 1, 1, 0],
            [0, 1, 1, 1, 0, 0, 1, 1, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 1, 1, 1, 0, 0, 1, 1, 0],
            [1, 0, 0, 0, 0, 1, 1, 1, 0],
            [1, 0, 0, 1, 1, 1, 0, 0, 1],
            [1, 1, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 1, 0, 0, 0, 0, 0, 0]
        ], currentRotation),
        boss: rotatePattern([
            [0, 1, 0],
            [1, 1, 1],
            [1, 0, 1],
            [1, 1, 1],
            [0, 1, 0]
        ], currentRotation),
        nova: rotatePattern([
            [0, 0, 1, 1, 1, 0, 0],
            [0, 1, 0, 0, 0, 1, 0],
            [1, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 1],
            [0, 0, 0, 0, 0, 0, 0],
            [1, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 1]
        ], currentRotation)
    };

    drawBrushIcon(dotCanvas, brushes.dot);
    drawBrushIcon(walkerCanvas, brushes.walker);
    drawBrushIcon(boatCanvas, brushes.boat);
    drawBrushIcon(shipCanvas, brushes.ship);
    drawBrushIcon(bossCanvas, brushes.boss);
    drawBrushIcon(novaCanvas, brushes.nova);
}

function drawBrushIcon(canvas, pattern) {
    const ctx = canvas.getContext('2d');
    const size = canvas.width / 11;
    const offsetX = Math.floor((11 - pattern[0].length) / 2);
    const offsetY = Math.floor((11 - pattern.length) / 2);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pattern.forEach((row, y) => {
        row.forEach((cell, x) => {
            ctx.fillStyle = cell ? 'green' : 'black';
            ctx.fillRect((x + offsetX) * size, (y + offsetY) * size, size, size);
        });
    });
}

function showGhostBrush(event) {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / cellSize);
    const y = Math.floor((event.clientY - rect.top) / cellSize);
    drawGrid();
    const pattern = getCurrentBrushPattern();
    drawGhostPattern(x, y, pattern);
}

function getCurrentBrushPattern() {
    switch (currentBrush) {
        case 'walker':
            return rotatePattern([
                [0, 0, 0, 0, 0],
                [0, 0, 1, 0, 0],
                [0, 0, 0, 1, 0],
                [0, 1, 1, 1, 0],
                [0, 0, 0, 0, 0]
            ], currentRotation);
        case 'boat':
            return rotatePattern([
                [1, 0, 0, 1, 0],
                [0, 0, 0, 0, 1],
                [1, 0, 0, 0, 1],
                [0, 1, 1, 1, 1]
            ], currentRotation);
        case 'ship':
            return rotatePattern([
                [0, 0, 1, 0, 0, 0, 0, 0, 0],
                [1, 1, 0, 0, 0, 0, 0, 0, 0],
                [1, 0, 0, 1, 1, 1, 0, 0, 1],
                [1, 0, 0, 0, 0, 1, 1, 1, 0],
                [0, 1, 1, 1, 0, 0, 1, 1, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 1, 1, 1, 0, 0, 1, 1, 0],
                [1, 0, 0, 0, 0, 1, 1, 1, 0],
                [1, 0, 0, 1, 1, 1, 0, 0, 1],
                [1, 1, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 1, 0, 0, 0, 0, 0, 0]
            ], currentRotation);
        case 'boss':
            return rotatePattern([
                [0, 1, 0],
                [1, 1, 1],
                [1, 0, 1],
                [1, 1, 1],
                [0, 1, 0]
            ], currentRotation);
        case 'nova':
            return rotatePattern([
                [0, 0, 1, 1, 1, 0, 0],
                [0, 1, 0, 0, 0, 1, 0],
                [1, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 1],
                [0, 0, 0, 0, 0, 0, 0],
                [1, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 1]
            ], currentRotation);
        default:
            return [[1]]; // Solo una celda viva para el brush 'dot'
    }
}

function drawGhostPattern(x, y, pattern) {
    const offsetX = Math.floor(pattern[0].length / 2);
    const offsetY = Math.floor(pattern.length / 2);
    ctx.fillStyle = 'rgba(127, 255, 212, 0.5)';
    pattern.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
            if (cell) {
                const newX = (x + colIndex - offsetX + gridWidth) % gridWidth;
                const newY = (y + rowIndex - offsetY + gridHeight) % gridHeight;
                ctx.fillRect(newX * cellSize, newY * cellSize, cellSize, cellSize);
            }
        });
    });
}

// Dibujar la cuadrícula inicial
drawGrid();
updateBrushIcons();

/* 
  ********************************************
  *✨ Creado por Hevel y Gunther          ✨*
  *         "El Juego de la Vida"            *
  *                                 /\_/\    *
  *                                ( ^.^ )   *
  *🌟Donaciones ETH:               (") (")💫*
  *0x9bbfe47b50A3BDb9Ea9495f643f370CD29533F62*
  ********************************************
*/
