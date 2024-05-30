export class Entity {

	x;
	y;
	size;
	radius;
	grid;
	cellSize;
	debugColor;
	debug;
	dead;

	constructor(x, y, size, grid, cellSize, debugColor) {
		this.x = x;
		this.y = y;
		this.size = size;
		this.radius = this.size / 2;
		this.grid = grid;
		this.cellSize = cellSize;
		this.debugColor = debugColor;
		this.debug = true;
		this.dead = false;
	}

	/** Return cell closest to entity center */
	getCenterCell(newX, newY) {
		// Pacman x and y are the center of the pacman but cell index is the top left corner of the cell
		const cellX = Math.round((newX - this.cellSize / 2) / this.cellSize);
		const cellY = Math.round((newY - this.cellSize / 2) / this.cellSize);
		return { x: cellX, y: cellY };
	}

	draw(context, deltaTime, gameTime) {
		if (this.debug) {
			// DEBUG: Draw center cell
			const cell = this.getCenterCell(this.x, this.y);
			context.strokeStyle = this.debugColor;
			context.lineWidth = 1;
			context.strokeRect(cell.x * this.cellSize, cell.y * this.cellSize, this.cellSize, this.cellSize);
		}
	}

	move(deltaTime, gameTime) {
		// Do nothing
	}

}