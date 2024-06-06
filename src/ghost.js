import { Entity } from "./entity.js";
import { WALL, CELL_SIZE } from "./constants.js";
import { SPEED as PACMAN_SPEED } from "./pacman.js";

const SPEED = PACMAN_SPEED * 0.875; // px/s
const FRIGHTENED_SPEED = 60; // px/s
const RESPAWN_DURATION = 3000; // ms
const RESPAWN = { x: 14 * CELL_SIZE, y: 14 * CELL_SIZE + CELL_SIZE / 2 };

const FRAME_COUNT = 2;
const SPRITE_SIZE = 16; // px
const DIRECTION_TO_SPRITE_ORDER = {
	UP: 2,
	DOWN: 3,
	LEFT: 1,
	RIGHT: 0
};

// Distance a ghost needs to move to change animation frame
const DISTANCE_PER_FRAME = CELL_SIZE / 2; // px

export class Ghost extends Entity {
	direction;
	conf;
	pacman;
	respawning;
	score;
	image;
	
	/** Distance the ghost has moved since last frame change */
	frameDist;

	constructor(x, y, direction, conf, grid, pacman, score) {
		super(x, y, CELL_SIZE * 1.5, grid, conf.color);
		this.direction = direction;
		this.conf = conf;
		this.pacman = pacman;
		this.score = score;
		this.respawning = false;
		this.image = document.getElementById("ghosts");
		this.frameDist = 0;
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
				this.respawn();
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
			this.respawn();
		}, RESPAWN_DURATION);
	}


	draw(context, deltaTime) {
		if (this.respawning) {
			this.drawRespawning(context);
		} else if (this.pacman.energized) {
			this.drawFrightened(context, deltaTime);
		} else {
			this.drawMoving(context, deltaTime);
		}

		super.draw(context, deltaTime);
	}

	drawRespawning(context) {
		context.drawImage(this.image, 
			// Position of the top left corner of the sprite in the image
			(8 + DIRECTION_TO_SPRITE_ORDER[this.direction]) * SPRITE_SIZE, SPRITE_SIZE,
			// Height and width of the sprite in the image
			SPRITE_SIZE, SPRITE_SIZE, 
			// Position of the top left corner of the sprite on the canvas
			this.x - SPRITE_SIZE, this.y - SPRITE_SIZE, 
			// Height and width of the sprite on the canvas
			SPRITE_SIZE * 2, SPRITE_SIZE * 2 
		);
	}

	drawFrightened(context, deltaTime) {
		this.frameDist += SPEED * (deltaTime / 1000);
		const frame = Math.floor(this.frameDist / DISTANCE_PER_FRAME) % FRAME_COUNT;

		context.drawImage(this.image, 
			// Position of the top left corner of the sprite in the image
			(8 + frame) * SPRITE_SIZE, 0,
			// Height and width of the sprite in the image
			SPRITE_SIZE, SPRITE_SIZE, 
			// Position of the top left corner of the sprite on the canvas
			this.x - SPRITE_SIZE, this.y - SPRITE_SIZE, 
			// Height and width of the sprite on the canvas
			SPRITE_SIZE * 2, SPRITE_SIZE * 2 
		);
	}

	drawMoving(context, deltaTime) {
		this.frameDist += SPEED * (deltaTime / 1000);
		const frame = Math.floor(this.frameDist / DISTANCE_PER_FRAME) % FRAME_COUNT;

		context.drawImage(this.image, 
			// Position of the top left corner of the sprite in the image
			(DIRECTION_TO_SPRITE_ORDER[this.direction] * FRAME_COUNT + frame) * SPRITE_SIZE, this.conf.spriteIndexY * SPRITE_SIZE,
			// Height and width of the sprite in the image
			SPRITE_SIZE, SPRITE_SIZE, 
			// Position of the top left corner of the sprite on the canvas
			this.x - SPRITE_SIZE, this.y - SPRITE_SIZE, 
			// Height and width of the sprite on the canvas
			SPRITE_SIZE * 2, SPRITE_SIZE * 2 
		);
	}

	respawn() {
		this.x = RESPAWN.x;
		this.y = RESPAWN.y;
		this.respawning = false;
	}
}