import { Ghost } from './ghost.js';
import { Pacman } from './pacman.js';
import { level } from './level.js';
import { Score } from "./score.js";
import {WALL, BARRIER, DOT, ENERGIZER, READY_TIME} from "./constants.js";
import {Energizer} from "./energizer.js";

const canvas = document.getElementById('game');
const context = canvas.getContext('2d');
const readyElement = document.getElementById('ready');
let gameTime = 0;
const gameDeltaTime = 1000 / 60; // ms

const cellSize = canvas.height / level.length;
const dotRadius = cellSize / 10;

let entities = [];
let pacman;
const score = new Score();

let game;
let paused = false;

function draw() {
	// Draw background
	context.fillStyle = "black";
	context.fillRect(0, 0, canvas.width, canvas.height);

	// Draw grid
	for (let y = 0; y < level.length; y++) {
		for (let x = 0; x < level[y].length; x++) {
			const cell = level[y][x];
			if (cell === WALL) {
				context.fillStyle = 'blue'; // color of wall
				context.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
			} else if (cell === BARRIER) {
				context.fillStyle = 'pink'; // color of wall
				const height = cellSize / 5;
				context.fillRect(x * cellSize, y * cellSize + cellSize / 2 - height / 2, cellSize, height);
			} else if (cell === DOT) {
				context.fillStyle = 'pink'; // color of energizer
				context.beginPath();
				context.arc(x * cellSize + cellSize / 2, y * cellSize + cellSize / 2, dotRadius, 0, 2 * Math.PI);
				context.fill();
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
	if (event.code === 'Space') {
		if (paused) {
			game = setInterval(run, gameDeltaTime);
		} else {
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
	pacman = new Pacman(14 * cellSize, 23 * cellSize + cellSize / 2, 'RIGHT', level, cellSize, score);
	for (let y = 0; y < level.length; y++) {
		for (let x = 0; x < level[y].length; x++) {
			const cell = level[y][x];
			if (cell === ENERGIZER) {
				entities.push(new Energizer(x * cellSize + cellSize / 2, y * cellSize + cellSize / 2, cellSize, level, pacman, score));
			}
		}
	}

	entities.push(
		pacman,
		new Ghost(14 * cellSize, 11 * cellSize + cellSize / 2, 'RIGHT', 'red', level, cellSize),
		new Ghost(12 * cellSize, 14 * cellSize + cellSize / 2, 'DOWN', 'cyan', level, cellSize),
		new Ghost(14 * cellSize, 14 * cellSize + cellSize / 2, 'LEFT', 'pink', level, cellSize),
		new Ghost(16 * cellSize, 14 * cellSize + cellSize / 2, 'UP', 'orange', level, cellSize)
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
