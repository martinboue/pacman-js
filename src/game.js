import { Ghost } from './ghost.js';
import { Pacman } from './pacman.js';
import { level } from './level.js';
import { Score } from "./score.js";
import { DOT, ENERGIZER, READY_TIME, CELL_SIZE } from "./constants.js";
import { Energizer } from "./energizer.js";
import { Dot } from './dot.js';

const DELTA_TIME = 1000 / 60; // ms

export class Game {

    time;
    paused;
    entities;
    pacman;
    canvas;
    context;
    readyElement;
    pauseElement;
    score;
    over;
    starting;

    interval;

    constructor(canvas, context) {
        this.time = 0;
        this.paused = false;
        this.entities = [];
        this.canvas = canvas;
        this.context = context;
        
        this.readyElement = document.getElementById('ready');
        this.pauseElement = document.getElementById('pause');
		this.gameOverElement = document.getElementById('game-over');
        this.score = new Score(this);
        this.over = false;
    }

    start() {
        // Create entities (pacman, ghost and energizers)
        this.entities = [];
        this.pacman = new Pacman(level, this.score, this);
        for (let y = 0; y < level.length; y++) {
            for (let x = 0; x < level[y].length; x++) {
                const cell = level[y][x];
                if (cell === ENERGIZER) {
                    this.entities.push(new Energizer(x * CELL_SIZE + CELL_SIZE / 2, y * CELL_SIZE + CELL_SIZE / 2, level, this.pacman, this.score));
                } else if (cell === DOT) { 
                    this.entities.push(new Dot(x * CELL_SIZE + CELL_SIZE / 2, y * CELL_SIZE + CELL_SIZE / 2, level, this.pacman, this.score));
                }
            }
        }
    
        this.entities.push(
            this.pacman,
            new Ghost(14 * CELL_SIZE, 11 * CELL_SIZE + CELL_SIZE / 2, 'RIGHT', 'red', level, this.pacman),
            new Ghost(12 * CELL_SIZE, 14 * CELL_SIZE + CELL_SIZE / 2, 'DOWN', 'cyan', level, this.pacman),
            new Ghost(14 * CELL_SIZE, 14 * CELL_SIZE + CELL_SIZE / 2, 'LEFT', 'pink', level, this.pacman),
            new Ghost(16 * CELL_SIZE, 14 * CELL_SIZE + CELL_SIZE / 2, 'UP', 'orange', level, this.pacman)
        );
    
        // Draw once then start ready timer
        this.starting = true;
        this.draw();
        this.readyElement.style.display = 'block';
        this.gameOverElement.style.display = "none";
        this.pauseElement.style.display = "none";
        setTimeout(() => {
            this.starting = false;
            this.interval = setInterval(this.run, DELTA_TIME);
            this.readyElement.style.display = 'none';
            window.addEventListener('keydown', this.handleKeyDown);
        }, READY_TIME);
    }

    pause() {
        if (this.over || this.starting) return;

        clearInterval(this.interval);
        this.interval = null;
        this.pauseElement.style.display = 'block';
        this.paused = true;
    }

    resume() {
        this.interval = setInterval(this.run, DELTA_TIME);
        this.pauseElement.style.display = 'none';
        this.paused = false;
    }

    run = () => {
        this.time += DELTA_TIME;
        this.draw();
        this.entities.forEach(e => e.move(DELTA_TIME, this.time));
        this.entities = this.entities.filter(e => !e.dead);
    }

    draw() {
        // Clear canvas
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw entities
        this.entities.forEach(e => e.draw(this.context, DELTA_TIME, this.time));

    }

    end() {
        window.removeEventListener('keydown', this.handleKeyDown);
        this.over = true;
        this.gameOverElement.style.display = "block";
        clearInterval(this.interval);
    }

}