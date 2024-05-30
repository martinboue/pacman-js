import { Ghost } from './ghost.js';
import { Pacman } from './pacman.js';
import { level } from './level.js';
import { Score } from "./score.js";
import { DOT, ENERGIZER, READY_TIME, CELL_SIZE } from "./constants.js";
import {Energizer} from "./energizer.js";

const canvas = document.getElementById('game');
const context = canvas.getContext('2d');
context.imageSmoothingEnabled = false;
context.webkitImageSmoothingEnabled = false;
context.mozImageSmoothingEnabled = false;

const readyElement = document.getElementById('ready');
const pauseElement = document.getElementById('pause');
let gameTime = 0;
const gameDeltaTime = 1000 / 60; // ms

let entities = [];
let pacman;
const score = new Score();

let game;
let paused = false;

function draw() {
	// Clear canvas
	context.clearRect(0, 0, canvas.width, canvas.height);

	// Draw grid
	for (let y = 0; y < level.length; y++) {
		for (let x = 0; x < level[y].length; x++) {
			const cell = level[y][x];
			if (cell === DOT) {
				context.fillStyle = 'pink';
				context.fillRect(x * CELL_SIZE + CELL_SIZE / 2, y * CELL_SIZE + CELL_SIZE / 2, 3, 3);
			}
		}
	}

	// Draw entities
	entities.forEach(e => e.draw(context, gameDeltaTime, gameTime));
}

function run() {
	gameTime += gameDeltaTime;
	draw();
	entities.forEach(e => e.move(gameDeltaTime, gameTime));
	entities = entities.filter(e => !e.dead);
}

window.addEventListener('keydown', (event) => {
	if (event.code === 'Space' && game != null) {
		if (paused) {
			pauseElement.style.display = 'none';
			game = setInterval(run, gameDeltaTime);
		} else {
			pauseElement.style.display = 'block';
			clearInterval(game);
		}
		paused = !paused;
	}
});

function start() {
	// Reset
	gameTime = 0;
	paused = false;


	// Create entities (pacman, ghost and energizers)
	entities = [];
	pacman = new Pacman(level, score);
	for (let y = 0; y < level.length; y++) {
		for (let x = 0; x < level[y].length; x++) {
			const cell = level[y][x];
			if (cell === ENERGIZER) {
				entities.push(new Energizer(x * CELL_SIZE + CELL_SIZE / 2, y * CELL_SIZE + CELL_SIZE / 2, level, pacman, score));
			}
		}
	}

	entities.push(
		pacman,
		new Ghost(14 * CELL_SIZE, 11 * CELL_SIZE + CELL_SIZE / 2, 'RIGHT', 'red', level, pacman),
		new Ghost(12 * CELL_SIZE, 14 * CELL_SIZE + CELL_SIZE / 2, 'DOWN', 'cyan', level, pacman),
		new Ghost(14 * CELL_SIZE, 14 * CELL_SIZE + CELL_SIZE / 2, 'LEFT', 'pink', level, pacman),
		new Ghost(16 * CELL_SIZE, 14 * CELL_SIZE + CELL_SIZE / 2, 'UP', 'orange', level, pacman)
	);

	// Draw once then start ready timer
	draw();
	readyElement.style.display = 'block';
	setTimeout(() => {
		game = setInterval(run, gameDeltaTime);
		readyElement.style.display = 'none';
	}, READY_TIME);

}

start();
