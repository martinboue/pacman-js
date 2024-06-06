import { Entity } from "./entity.js";
import { WALL, BARRIER, CELL_SIZE, PACMAN_SPAWN } from "./constants.js";

export const SPEED = CELL_SIZE * 11; // px/s
const DYING_DURATION = 1800; // ms
const RESPAWN_DURATION = 3000; // ms
const ENERGIZED_DURATION = 5000; // ms
const DIRECTION_BUFFER_DURATION = 200; // ms

const DIRECTIONS = {
	UP: { x: 0, y: -1 },
	DOWN: { x: 0, y: 1 },
	LEFT: { x: -1, y: 0 },
	RIGHT: { x: 1, y: 0 }
};

const KEY_TO_DIRECTION = {
	ArrowUp: 'UP',
	ArrowDown: 'DOWN',
	ArrowLeft: 'LEFT',
	ArrowRight: 'RIGHT',
};

const SPRITE_SIZE = 15; // px
const DIRECTION_TO_SPRITE = {
	UP: SPRITE_SIZE * 2,
	DOWN: SPRITE_SIZE * 3,
	LEFT: SPRITE_SIZE,
	RIGHT: 0
};
const FRAME_COUNT = 3;

const FRAME_DYING_COUNT = 11;
const SPRITE_DYING_SIZE = 18; // px

// Distance pacman needs to move to change animation frame
const DISTANCE_PER_FRAME = CELL_SIZE / 2; // px

export class Pacman extends Entity {

	score;
	game;
	direction;
	nextDirection;
	stopped;
	changedDirectionTime;
	respawning;
	energized;
	ghostEatenWhileEnergized;
	image;
	imageDying;

	/** Distance pacman has moved since last frame change */
	frameDist;
	/** Current frame index from 0 to 2 */
	frame;
	frameReverse;
	frameDyingTime;

	constructor(grid, score, game) {
		super(PACMAN_SPAWN.x, PACMAN_SPAWN.y, CELL_SIZE * 1.5, grid, 'yellow');
		this.score = score;
		this.game = game;
		this.direction = 'RIGHT';
		this.nextDirection = null;
		this.stopped = false;
		this.respawning = false;
		this.energized = false;
		this.ghostEatenWhileEnergized = 0;
		this.frameDist = 0;
		this.frame = 0;
		this.frameReverse = false;
		this.frameDyingTime = 0;

		window.addEventListener('keydown', (event) => {
			if (this.game.paused || this.game.starting || this.respawning) return;

			if (event.key in KEY_TO_DIRECTION) {
				this.nextDirection = KEY_TO_DIRECTION[event.key];
				this.changedDirectionTime = 0;
			}
		});

		this.image = document.getElementById('pacman');
		this.imageDying = document.getElementById('pacman-dying');
	}


	move(deltaTime) {
		if (this.respawning) return;

		const nextPos = {x: this.x, y: this.y};

		// Compute distance to move
		const dist = (deltaTime / 1000) * SPEED;
		const distVector = {x: dist * DIRECTIONS[this.direction].x, y: dist * DIRECTIONS[this.direction].y };
		nextPos.x += distVector.x;
		nextPos.y += distVector.y;

		const newCell = this.getCenterCell(nextPos.x, nextPos.y);

		// Wrap from left to right
		if (nextPos.x < 0) {
			newCell.x = this.grid[0].length - 1
			this.x = (newCell.x + 1) * CELL_SIZE;
		}
		// Wrap from right to left
		else if (nextPos.x >= (this.grid[0].length + 1) * CELL_SIZE) {
			newCell.x = 0;
			this.x = 0;
		}
		// Collision detection : check if the new position is valid
		else if (this.canMoveForward(nextPos.x, nextPos.y)) {
			this.x = nextPos.x;
			this.y = nextPos.y;
			this.stopped = false;
		} else {
			this.stopped = true;
		}

		// Make sure pacman is always centered along its axis
		this.snapToAxis(newCell);

		this.handleDirectionChange(deltaTime, nextPos);
	}

	handleDirectionChange(deltaTime, nextPos) {
		// Handle direction buffer
		this.changedDirectionTime += deltaTime;
		if (this.changedDirectionTime >= DIRECTION_BUFFER_DURATION && this.nextDirection != null) {
			this.nextDirection = null;
		}

		// Changing direction
		if (this.nextDirection != null && this.canMoveTo(this.nextDirection) && this.centerHasBeenCrossed(nextPos)) {
			this.direction = this.nextDirection;
			this.nextDirection = null;
		}
	}

	snapToAxis(newCell) {
		// Center Pacman on the Y-axis when moving horizontally
		if (this.stopped || this.direction === 'LEFT' || this.direction === 'RIGHT') {
			this.y = newCell.y * CELL_SIZE + CELL_SIZE / 2;
		}
		// Center Pacman on the X-axis when moving vertically
		if (this.stopped || this.direction === 'UP' || this.direction === 'DOWN') {
			this.x = newCell.x * CELL_SIZE + CELL_SIZE / 2;
		}
	}

	centerHasBeenCrossed(nextPos) {
		// Make sure the center of pacman has crossed the center of the cell before changing direction
		const centerCell = this.getCenterCell(nextPos.x, nextPos.y);
		if (this.nextDirection === 'UP' || this.nextDirection === 'DOWN') {
			if (this.direction === 'LEFT') return nextPos.x <= centerCell.x * CELL_SIZE + CELL_SIZE / 2;
			if (this.direction === 'RIGHT') return nextPos.x >= centerCell.x * CELL_SIZE + CELL_SIZE / 2;
		}
		if (this.nextDirection === 'LEFT' || this.nextDirection === 'RIGHT') {
			if (this.direction === 'UP') return nextPos.y <= centerCell.y * CELL_SIZE + CELL_SIZE / 2;
			if (this.direction === 'DOWN') return nextPos.y >= centerCell.y * CELL_SIZE + CELL_SIZE / 2;
		}

		// Reverse to opposite direction is always true
		return true;
	}

	canMoveTo(dir) {
		const cell = this.getCenterCell(this.x, this.y);
		if (dir === 'UP') cell.y--;
		else if (dir === 'DOWN') cell.y++;
		else if (dir === 'LEFT') cell.x--;
		else if (dir === 'RIGHT') cell.x++;

		const value = this.grid[cell.y][cell.x];
		return value !== WALL && value !== BARRIER;
	}

	canMoveForward(nextX, nextY) {
		// Get the cell at the edge of pacman in its direction
		let edgeCell;
		if (this.direction === 'UP') edgeCell = this.getCenterCell(nextX, nextY - CELL_SIZE / 2);
		if (this.direction === 'DOWN') edgeCell = this.getCenterCell(nextX, nextY + CELL_SIZE / 2);
		if (this.direction === 'LEFT') edgeCell = this.getCenterCell(nextX - CELL_SIZE / 2, nextY);
		if (this.direction === 'RIGHT') edgeCell = this.getCenterCell(nextX + CELL_SIZE / 2, nextY);
		const tile = this.grid[edgeCell.y][edgeCell.x]
		return tile !== WALL && tile !== BARRIER;
	}

	draw(context, deltaTime) {
		if (this.respawning) {
			this.drawDying(context, deltaTime);
		} else if (this.stopped) {
			this.drawStopped(context);
		} else {
			this.drawMoving(context, deltaTime);
		}

		super.draw(context, deltaTime);
	}

	drawDying(context, deltaTime) {
		if (this.frameDyingTime >= DYING_DURATION) return;

		this.frameDyingTime += deltaTime;
		const frameDuration = DYING_DURATION / FRAME_DYING_COUNT;
		const dyingFrame = Math.floor(this.frameDyingTime / frameDuration);

		context.drawImage(this.imageDying, 
			// Position of the top left corner of the sprite in the image
			dyingFrame * SPRITE_DYING_SIZE, 0,
			// Height and width of the sprite in the image
			SPRITE_DYING_SIZE, SPRITE_DYING_SIZE, 
			// Position of the top left corner of the sprite on the canvas
			this.x - SPRITE_DYING_SIZE, this.y  - SPRITE_DYING_SIZE, 
			// Height and width of the sprite on the canvas
			SPRITE_DYING_SIZE * 2, SPRITE_DYING_SIZE * 2
		);
	}

	drawMoving(context, deltaTime) {
		// We use distance to change frame to run animation faster when pacman is going faster
		this.frameDist += SPEED * (deltaTime / 1000);

		if (this.frameDist >= DISTANCE_PER_FRAME) {
			this.frame = this.frameReverse ? (this.frame - 1) : (this.frame + 1);
			if (this.frame === 0 || this.frame === FRAME_COUNT - 1) {
				this.frameReverse = !this.frameReverse;
			}
			this.frameDist = 0;
		}

		context.drawImage(this.image, 
			// Position of the top left corner of the sprite in the image
			this.frame * SPRITE_SIZE, DIRECTION_TO_SPRITE[this.direction],
			// Height and width of the sprite in the image
			SPRITE_SIZE, SPRITE_SIZE, 
			// Position of the top left corner of the sprite on the canvas
			this.x - SPRITE_SIZE, this.y - SPRITE_SIZE, 
			// Height and width of the sprite on the canvas
			SPRITE_SIZE * 2 , SPRITE_SIZE * 2
		);
	}

	drawStopped(context) {
		// Always draw the mouth opened when stopped
		context.drawImage(this.image, 
			// Position of the top left corner of the sprite in the image
			SPRITE_SIZE, DIRECTION_TO_SPRITE[this.direction],
			// Height and width of the sprite in the image
			SPRITE_SIZE, SPRITE_SIZE, 
			// Position of the top left corner of the sprite on the canvas
			this.x - SPRITE_SIZE, this.y - SPRITE_SIZE, 
			// Height and width of the sprite on the canvas
			SPRITE_SIZE * 2 , SPRITE_SIZE * 2
		);
	}

	die() {
		const stillAlive = this.score.removeLife();
		
		if (stillAlive) {
			this.respawning = true;
			this.frameDyingTime = 0;
			
			setTimeout(() => {
				this.respawning = false;
				this.x = PACMAN_SPAWN.x;
				this.y = PACMAN_SPAWN.y;
				this.direction = 'RIGHT';
			}, DYING_DURATION + RESPAWN_DURATION);
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