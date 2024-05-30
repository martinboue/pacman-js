
export class Score {

	score;
	scoreElement;

	constructor() {
		this.score = 0;
		this.scoreElement = document.getElementById('score');
	}


	add(points) {
		this.score += points;
		this.scoreElement.innerText = "SCORE: " + this.score;
	}


}