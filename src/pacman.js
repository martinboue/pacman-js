import { Entity } from "./entity.js";
import { WALL, BARRIER, CELL_SIZE, PACMAN_SPAWN } from "./constants.js";

const SPEED = 100; // px/s
const RESPAWN_DURATION = 3000; // ms

const directionsToAngle = {
	UP: -0.5 * Math.PI,
	DOWN: 0.5 * Math.PI,
	LEFT: Math.PI,
	RIGHT: 0
};

export class Pacman extends Entity {

	direction;
	score;
	respawning;

	constructor(grid, score) {
		super(PACMAN_SPAWN.x, PACMAN_SPAWN.y, CELL_SIZE * 1.5, grid, 'yellow');
		this.direction = 'RIGHT';
		this.score = score;
		this.respawning = false;

		window.addEventListener('keydown', (event) => {
			switch (event.key) {
				case 'ArrowUp':
					this.direction = 'UP';
					break;
				case 'ArrowDown':
					this.direction = 'DOWN';
					break;
				case 'ArrowLeft':
					this.direction = 'LEFT';
					break;
				case 'ArrowRight':
					this.direction = 'RIGHT';
					break;
			}
		});
	}

	move(deltaTime) {
		if (this.respawning) return;

		let newX = this.x;
		let newY = this.y;

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

		// Eat the dot
		if (this.grid[newCell.y][newCell.x] === '.') {
			this.grid[newCell.y][newCell.x] = 0;
			this.score.add(10);
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
		const angleDir = directionsToAngle[this.direction];

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
	
			setTimeout(() => {
				this.respawning = false;
				this.x = PACMAN_SPAWN.x;
				this.y = PACMAN_SPAWN.y;
			}, RESPAWN_DURATION);
		} else {
			this.dead = true;
		}
	}

}