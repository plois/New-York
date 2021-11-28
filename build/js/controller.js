class Controller {
	constructor(uctConst) {
		this.game = null;
		this.view = new View(this);
		this.numOfMCTSSimulations = null;
		this.uctConst = uctConst;
		this.worker = null;
	}

	startNewGame(isHuman, numOfMCTSSimulations) {
		let game = new Game(isHuman);
		this.numOfMCTSSimulations = numOfMCTSSimulations;
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
			if (!this.game.pawnOfTurn.isHuman) {
				let game = Game.clone(this.game);
				if (game.winner === null) {
					let ai = new AI(
						this.numOfMCTSSimulations,
						this.uctConst,
						false,
						false
					);
					let move = ai.chooseNextMove(game);
					this.doMove(move);
				}
			}
		}
	}
}
