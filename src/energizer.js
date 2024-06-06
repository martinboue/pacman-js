import {Entity} from "./entity.js";
import { CELL_SIZE } from "./constants.js";

const BLINK_DURATION = 300; // ms

export class Energizer extends Entity {

	time
	pacman;
	visible;
	score;

	constructor(x, y, grid, pacman, score) {
		super(x, y, CELL_SIZE / 4, grid, 'pink');
		this.pacman = pacman;
		this.score = score;
		this.time = 0;
		this.visible = true;
	}

	draw(context, deltaTime) {
		this.time += deltaTime;
		if (this.time >= BLINK_DURATION) {
			this.visible = !this.visible;
			this.time = 0;
		}

		if (this.visible) {
			context.fillStyle = 'pink'; // color of dot
			context.beginPath();
			context.arc(this.x, this.y, CELL_SIZE / 3, 0, 2 * Math.PI);
			context.fill();
		}
		
		super.draw(context, deltaTime);
	}

	move() {
		const pacmanCell = this.pacman.getCenterCell(this.pacman.x, this.pacman.y);
		const cell = this.getCenterCell(this.x, this.y);
		if (pacmanCell.x === cell.x && pacmanCell.y === cell.y) {
			this.die();
		}
	}

	die() {
		this.score.add(50);
		this.dead = true;
		this.pacman.energize();
	}

}