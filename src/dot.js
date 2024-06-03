import {Entity} from "./entity.js";

export class Dot extends Entity {

    constructor(x, y, grid, pacman, score) {
        super(x, y, 3, grid, 'pink');
        this.pacman = pacman;
        this.score = score;
    }

    draw(context, deltaTime, gameTime) {
        context.fillStyle = 'pink';
        context.fillRect(this.x, this.y, this.size, this.size);
    }
 
	move(deltaTime, gameTime) {
		const pacmanCell = this.pacman.getCenterCell(this.pacman.x, this.pacman.y);
		const cell = this.getCenterCell(this.x, this.y);
		if (pacmanCell.x === cell.x && pacmanCell.y === cell.y) {
			this.die();
		}
	}

	die() {
		this.score.add(10);
		this.dead = true;
	}

}