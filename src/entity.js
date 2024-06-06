import {BARRIER, CELL_SIZE, WALL} from "./constants.js";

export class Entity {

	/** Center position of the entity */
	x;
	y;
	size;
	radius;
	grid;
	debugColor;
	debug;
	dead;

	constructor(x, y, size, grid, debugColor) {
		this.x = x;
		this.y = y;
		this.size = size;
		this.radius = this.size / 2;
		this.grid = grid;
		this.debugColor = debugColor;
		this.debug = false;
		this.dead = false;
	}

	/** Return cell closest to entity center */
	getCenterCell(newX, newY) {
		// Pacman x and y are the center of the pacman but cell index is the top left corner of the cell
		const cellX = Math.round((newX - CELL_SIZE / 2) / CELL_SIZE);
		const cellY = Math.round((newY - CELL_SIZE / 2) / CELL_SIZE);
		return { x: cellX, y: cellY };
	}

	draw(context, deltaTime) {
		if (this.debug) {
			// DEBUG: Draw center cell
			const cell = this.getCenterCell(this.x, this.y);
			context.strokeStyle = this.debugColor;
			context.lineWidth = 1;
			context.strokeRect(cell.x * CELL_SIZE, cell.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);

			// DEBUG : Draw center of entity
			context.fillStyle = 'white';
			context.fillRect(this.x, this.y, 1, 1);
		}
	}

	move(deltaTime) {
		// Do nothing
	}

}