import { Entity } from "./entity.js";
import { WALL, CELL_SIZE } from "./constants.js";

const SPEED = 90; // px/s
const FRIGHTENED_SPEED = 60; // px/s
const RESPAWN_DURATION = 3000; // ms
const RESPAWN = { x: 14 * CELL_SIZE, y: 14 * CELL_SIZE + CELL_SIZE / 2 };

export class Ghost extends Entity {
	direction;
	color;
	pacman;
	respawning;
	score;

	constructor(x, y, direction, color, grid, pacman, score) {
		super(x, y, CELL_SIZE * 1.5, grid, color);
		this.direction = direction;
		this.color = color;
		this.pacman = pacman;
		this.score = score;
		this.respawning = false;
	}

	move(deltaTime) {
		if (this.respawning) return;

		let newX = this.x;
		let newY = this.y;

		const dist = (deltaTime / 1000) * (this.pacman.energized ? FRIGHTENED_SPEED : SPEED);
		if (this.direction === 'UP') newY -= dist;
		else if (this.direction === 'DOWN') newY += dist;
		else if (this.direction === 'LEFT') newX -= dist;
		else if (this.direction === 'RIGHT') newX += dist;

		let newCell = this.getCenterCell(newX, newY);

		// Wall collision detection
		if (this.grid[newCell.y][newCell.x] !== WALL) {
			this.x = newX;
			this.y = newY;
		} else {
			// If the ghost hits a wall, randomly change its direction
			const directions = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
			this.direction = directions[Math.floor(Math.random() * directions.length)];
			newCell = this.getCenterCell(this.x, this.y);
		}

		// Pacman collision detection
		const pacmanCell = this.pacman.getCenterCell(this.pacman.x, this.pacman.y);
		if (!this.pacman.respawning && !this.respawning && !this.pacman.dead && newCell.x === pacmanCell.x && newCell.y === pacmanCell.y) {
			if (this.pacman.energized) {
				this.die();
			} else {
				this.pacman.die();
			}
		}
	}


	die() {
		this.respawning = true;
		// 1st ghost eaten will give 200 points, then 400, 800, 1600, ...
		const points = 200 * Math.pow(2, this.pacman.ghostEatenWhileEnergized);
		this.score.add(points);
		this.pacman.ghostEatenWhileEnergized++;

		setTimeout(() => {
			this.x = RESPAWN.x;
			this.y = RESPAWN.y;
			this.respawning = false;
		}, RESPAWN_DURATION);
	}


	draw(context) {
		super.draw(context);

		// Draw ghost
		if (this.respawning) {
			context.fillStyle = "grey";
			context.beginPath();
			context.arc(this.x, this.y, this.radius / 2, 0, 2 * Math.PI);
			context.fill();
		} else {
			if (this.pacman.energized) {
				context.fillStyle = "grey";
			} else {
				context.fillStyle = this.color;
			}
			context.beginPath();
			context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
			context.fill();
		}
	}
}