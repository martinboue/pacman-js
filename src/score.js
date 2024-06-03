const HIGH_SCORE_KEY = 'high-score';

const LIFE_IMG_TAG = '<img class="pixel-art" src="./life.png" alt="Life">';

export class Score {

	game;
	points;
	scoreElement;
	lives;
	livesElement;
	gameOverElement;
	highScore;
	highScoreElement;

	constructor(game) {
		this.game = game;
		this.points = 0;
		this.scoreElement = document.getElementById('score');
		this.lives = 3;
		this.livesElement = document.getElementById('lives');
		this.highScore = parseInt(localStorage.getItem(HIGH_SCORE_KEY) || 0);
		this.highScoreElement = document.getElementById('high-score');

		this.initScore();
	}

	initScore() {
		this.scoreElement.innerText = "SCORE: " + this.points;
		this.highScoreElement.innerText = "HIGH SCORE: " + this.highScore;
		this.updateLives();
	}

	add(points) {
		this.points += points;
		this.scoreElement.innerText = "SCORE: " + this.points;
	}

	removeLife() {
		this.lives--;
		this.updateLives();

		const stillAlive = this.lives >= 0;
		if (!stillAlive) {
			this.game.end();
			this.updateHighScore();
		}

		return stillAlive;
	}

	updateLives() {
		this.livesElement.innerHTML = LIFE_IMG_TAG.repeat(this.lives);
	}

	updateHighScore() {
		if (!this.highScore || this.points > this.highScore) {
			this.highScore = this.points;
			localStorage.setItem(HIGH_SCORE_KEY, this.highScore);
			this.highScoreElement.innerText = "HIGH SCORE: " + this.highScore;
		}
	}

}