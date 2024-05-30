import { Entity } from "./entity.js";
import { WALL } from "./constants.js";

const SPEED = 90; // px/s

export class Ghost extends Entity {
	direction;
	color;

	constructor(x, y, direction, color, grid, cellSize) {
		super(x, y, cellSize * 1.5, grid, cellSize, color);
		this.direction = direction;
		this.color = color;
	}

	move(deltaTime) {
		let newX = this.x;
		let newY = this.y;

		const dist = (deltaTime / 1000) * SPEED
		if (this.direction === 'UP') newY -= dist;
		else if (this.direction === 'DOWN') newY += dist;
		else if (this.direction === 'LEFT') newX -= dist;
		else if (this.direction === 'RIGHT') newX += dist;

		const newCell = this.getCenterCell(newX, newY);

		// Collision detection
		if (this.grid[newCell.y][newCell.x] !== WALL) {
			this.x = newX;
			this.y = newY;
		} else {
			// If the ghost hits a wall, randomly change its direction
			const directions = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
			this.direction = directions[Math.floor(Math.random() * directions.length)];
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