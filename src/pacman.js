import { Entity } from "./entity.js";
import { WALL, BARRIER, CELL_SIZE, PACMAN_SPAWN } from "./constants.js";

const SPEED = 100; // px/s
const RESPAWN_DURATION = 3000; // ms
const ENERGIZED_DURATION = 5000; // ms
const DIRECTION_BUFFER_DURATION = 200; // ms

const DIRECTION_TO_ANGLE = {
	UP: -0.5 * Math.PI,
	DOWN: 0.5 * Math.PI,
	LEFT: Math.PI,
	RIGHT: 0
};

const DIRECTION_TO_OPPOSITE = {
	UP: 'DOWN',
	DOWN: 'UP',
	LEFT: 'RIGHT',
	RIGHT: 'LEFT'
};

const KEY_TO_DIRECTION = {
	ArrowUp: 'UP',
	ArrowDown: 'DOWN',
	ArrowLeft: 'LEFT',
	ArrowRight: 'RIGHT',
}

export class Pacman extends Entity {

	score;
	game;
	direction;
	nextDirection;
	changedDirectionTime;
	respawning;
	energized;
	ghostEatenWhileEnergized;

	constructor(grid, score, game) {
		super(PACMAN_SPAWN.x, PACMAN_SPAWN.y, CELL_SIZE * 1.5, grid, 'yellow');
		this.score = score;
		this.game = game;
		this.direction = 'RIGHT';
		this.nextDirection = null;
		this.respawning = false;
		this.energized = false;
		this.ghostEatenWhileEnergized = 0;

		window.addEventListener('keydown', (event) => {
			if (this.game.paused || this.game.starting || this.respawning) return;

			if (event.key in KEY_TO_DIRECTION) {
				this.nextDirection = KEY_TO_DIRECTION[event.key];
				this.changedDirectionTime = 0;
			}
		});
	}

	move(deltaTime) {
		if (this.respawning) return;

		let newX = this.x;
		let newY = this.y;

		// Handle direction buffer
		this.changedDirectionTime += deltaTime;
		if (this.changedDirectionTime >= DIRECTION_BUFFER_DURATION && this.nextDirection != null) {
			this.nextDirection = null;
		}

		// Changing direction
		if (this.nextDirection != null) {
			// Moving in opposite direction
			if (this.nextDirection === DIRECTION_TO_OPPOSITE[this.direction]) {
				this.direction = this.nextDirection;
				this.nextDirection = null;
			}
			// Turning
			else if (this.canMoveTo(this.nextDirection)) {
				this.direction = this.nextDirection;
				this.nextDirection = null;
			}
		}

		const dist = (deltaTime / 1000) * SPEED
		if (this.direction === 'UP') newY -= dist;
		else if (this.direction === 'DOWN') newY += dist;
		else if (this.direction === 'LEFT') newX -= dist;
		else if (this.direction === 'RIGHT') newX += dist;

		const newCell = this.getCenterCell(newX, newY);

		// Wrap from left to right
		if (newX < 0) {
			newCell.x = this.grid[0].length - 1
			this.x = (newCell.x + 1) * CELL_SIZE;
		}
		// Wrap from right to left
		else if (newX >= (this.grid[0].length + 1) * CELL_SIZE) {
			newCell.x = 0;
			this.x = 0;
		}
		// Collision detection : check if the new position is valid
		else if (this.grid[newCell.y][newCell.x] !== WALL && this.grid[newCell.y][newCell.x] !== BARRIER) {
			this.x = newX;
			this.y = newY;
		}
	}

	draw(context, deltaTime, gameTime) {
		// TODO : draw dying/respawning
		
		super.draw(context);

		context.fillStyle = 'yellow';
		const mouthSpeed = 0.01;
		const topOpenAngle = 0.75 * Math.PI
		const openToCloseAngle = 0.25 * Math.PI;
		// Make pacman face its direction
		const angleDir = DIRECTION_TO_ANGLE[this.direction];

		// Top mouth
		context.beginPath();
		const topAngle = topOpenAngle + (Math.sin(gameTime * mouthSpeed) + 1) / 2 * openToCloseAngle;
		context.arc(this.x, this.y, this.radius, topAngle + angleDir, topAngle - Math.PI + angleDir);
		context.fill();

		// Bottom mouth
		context.beginPath();
		const bottomAngle = (-1 * Math.sin(gameTime * mouthSpeed) + 1) / 2 * openToCloseAngle;
		context.arc(this.x, this.y, this.radius, bottomAngle + angleDir, bottomAngle - Math.PI + angleDir);
		context.fill();
	}

	die() {
		const stillAlive = this.score.removeLife();
		
		if (stillAlive) {
			this.respawning = true;
			this.direction = 'RIGHT';
			
			setTimeout(() => {
				this.respawning = false;
				this.x = PACMAN_SPAWN.x;
				this.y = PACMAN_SPAWN.y;
			}, RESPAWN_DURATION);
		} else {
			this.dead = true;
		}
	}

	energize() {
		if (!this.energized) {
			this.ghostEatenWhileEnergized = 0;
		}
		this.energized = true;
		setTimeout(() => {
			this.energized = false;
		}, ENERGIZED_DURATION);
	}

}