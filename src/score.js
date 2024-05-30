
export class Score {

	score;
	scoreElement;
	lives;
	livesElement;
	gameOverElement;

	constructor() {
		this.score = 0;
		this.scoreElement = document.getElementById('score');
		this.lives = 0;
		this.livesElement = document.getElementById('lives');
		this.gameOverElement = document.getElementById('game-over');
		
		this.initScore();
	}

	initScore() {
		this.scoreElement.innerText = "SCORE: " + this.score;
		this.livesElement.innerText = this.lives;
	}


	add(points) {
		this.score += points;
		this.scoreElement.innerText = "SCORE: " + this.score;
	}

	removeLife() {
		this.lives--;
		this.livesElement.innerText = this.lives;

		const stillAlive = this.lives >= 0; 
		if (!stillAlive) {
			this.gameOverElement.style.display = "block";
		}

		return stillAlive;
	}


}