import { Game } from "./game.js";

const canvas = document.getElementById('game');
const context = canvas.getContext('2d');
context.imageSmoothingEnabled = false;
context.webkitImageSmoothingEnabled = false;
context.mozImageSmoothingEnabled = false;

window.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        if (game.over) {
            game = new Game(canvas, context);
            game.start();
        } else {
            if (game.paused) {
                game.resume();
            } else {
                game.pause();
            }
        }
    }
});

let game = new Game(canvas, context);
game.start();
