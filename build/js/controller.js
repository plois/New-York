class Controller {
	constructor() {
		this.game = null;
		this.view = new View(this);
	}

	startNewGame() {
		let game = new Game();
		this.game = game;
		this.view.game = this.game;
		this.view.render();
	}

	endGame() {
		this.game.winner = "Draw";
		this.view.game.winner = this.game.winner;
		this.view.render();
	}

	doMove(move) {
		if (this.game.doMove(move, true)) {
			this.view.render();
		}
	}
}
