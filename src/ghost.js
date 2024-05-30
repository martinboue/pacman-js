import { Entity } from "./entity.js";
import { WALL, CELL_SIZE } from "./constants.js";

const SPEED = 90; // px/s

export class Ghost extends Entity {
	direction;
	color;
	pacman;

	constructor(x, y, direction, color, grid, pacman) {
		super(x, y, CELL_SIZE * 1.5, grid, color);
		this.direction = direction;
		this.color = color;
		this.pacman = pacman;
	}

	move(deltaTime) {
		let newX = this.x;
		let newY = this.y;

		const dist = (deltaTime / 1000) * SPEED
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
		if (!this.pacman.respawning && !this.pacman.dead && newCell.x === pacmanCell.x && newCell.y === pacmanCell.y) {
			this.pacman.die();
		}
	}


	draw(context) {
		super.draw(context);

		// Draw ghost
		context.fillStyle = this.color;
		context.beginPath();
		context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
		context.fill();
	}
}