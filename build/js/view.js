class View {
	constructor(controller) {
		this.controller = controller;

		this._game = null;

		this.htmlMessageBox = document.getElementById("message_box");
		this.htmlBoardTable = document.getElementById("board_table");
		this.htmlPawns = [
			document.getElementById("pawn_1"),
			document.getElementById("pawn_2"),
		];

		this.buttons = {
			newGame: document.getElementById("new_game"),
			endGame: document.getElementById("end_game"),
		};

		const onclickNewGame = (e) => {
			this.startNewGame();
		};
		const onclickEndGame = (e) => {
			this.endGame();
		};

		this.buttons.newGame.onclick = onclickNewGame;
		this.buttons.endGame.onclick = onclickEndGame;

		this.buttons.newGame.disabled = false;
		this.buttons.endGame.disabled = true;
	}

	get game() {
		return this._game;
	}

	set game(game) {
		this._game = game;

		View.removeWalls();

		let wallNumList = document.getElementsByClassName("wall_num");
		this.htmlWallNum = { pawn_1: wallNumList[0], pawn_2: wallNumList[1] };
	}

	startNewGame() {
		this.controller.startNewGame();
		this.buttons.newGame.disabled = true;
		this.buttons.endGame.disabled = false;
	}

	endGame() {
		this.controller.endGame();
		this.buttons.newGame.disabled = false;
	}

	printMessage(message) {
		this.htmlMessageBox.innerHTML = message;
	}

	render() {
		this._removePreviousRender();
		this._renderNumberOfWalls();
		this._renderPawnPositions();
		this._renderWalls();
		if (this.game.winner !== null) {
			this.buttons.endGame.disabled = true;
			this.buttons.newGame.disabled = false;
			if (this.game.winner === "Draw") {
				this.printMessage("Draw...");
			} else {
				const id = this.game.winner.index;
				this.printMessage(
					`Player <span class="pawn_${id}">${id}</span> win!`
				);
			}
		} else {
			this._renderValidNextPawnPositions();
			this._renderValidNextWalls();
			const id = this.game.pawnOfTurn.index;
			this.printMessage(
				`Player <span class="pawn_${id}">${id}</span> turn`
			);
		}
	}

	_removePreviousRender() {
		for (let i = 0; i < this.htmlBoardTable.rows.length; i++) {
			for (let j = 0; j < this.htmlBoardTable.rows[0].cells.length; j++) {
				let element = this.htmlBoardTable.rows[i].cells[j];
				element.removeAttribute("onmouseenter");
				element.removeAttribute("onmouseleave");
				element.onclick = null;
			}
		}
		// remove pawn shadows which are for previous board
		let previousPawnShadows =
			document.getElementsByClassName("pawn shadow");
		let previousColShadows = document.getElementsByClassName("col shadow");
		while (previousPawnShadows.length !== 0) {
			previousPawnShadows[0].remove();
			previousColShadows[0].classList.remove("shadow");
		}
	}

	_renderNumberOfWalls() {
		this.htmlWallNum.pawn_1.innerHTML =
			this.game.board.pawns[0].numberOfWalls;
		this.htmlWallNum.pawn_2.innerHTML =
			this.game.board.pawns[1].numberOfWalls;
	}

	_renderPawnPositions() {
		this.htmlBoardTable.rows[
			this.game.board.pawns[0].position.row * 2
		].cells[this.game.board.pawns[0].position.col * 2].appendChild(
			this.htmlPawns[0]
		);
		this.htmlBoardTable.rows[
			this.game.board.pawns[1].position.row * 2
		].cells[this.game.board.pawns[1].position.col * 2].appendChild(
			this.htmlPawns[1]
		);
	}

	_renderValidNextPawnPositions() {
		const onclickNextPawnPosition = (e) => {
			const x = e.target;
			const row =
				x.parentElement.rowIndex / 2 ||
				x.parentElement.parentElement.rowIndex / 2;
			const col = x.cellIndex / 2 || x.parentElement.cellIndex / 2;
			this.controller.doMove([[row, col], null, null]);
		};

		for (let i = 0; i < 9; i++) {
			for (let j = 0; j < 9; j++) {
				if (this.game.validNextPositions[i][j] === true) {
					let element = this.htmlBoardTable.rows[i * 2].cells[j * 2];
					let pawnShadow = document.createElement("div");
					pawnShadow.classList.add("pawn");
					pawnShadow.classList.add(
						"pawn_" + this.game.pawnOfTurn.index
					);
					pawnShadow.classList.add("shadow");
					element.appendChild(pawnShadow);
					element.classList.add("shadow");
					element.onclick = onclickNextPawnPosition;
				}
			}
		}
	}

	_renderWalls() {
		for (let i = 0; i < 8; i++) {
			for (let j = 0; j < 8; j++) {
				if (this.game.board.walls.horizontal[i][j] === true) {
					let horizontalWall = document.createElement("div");
					horizontalWall.classList.add("horizontal_wall");

					if (
						!this.htmlBoardTable.rows[i * 2 + 1].cells[
							j * 2
						].hasChildNodes()
					) {
						for (let k = 0; k < 3; k++) {
							this.htmlBoardTable.rows[i * 2 + 1].cells[
								j * 2 + k
							].appendChild(horizontalWall.cloneNode(true));
						}
					}
				}
				if (this.game.board.walls.vertical[i][j] === true) {
					let verticalWall = document.createElement("div");
					verticalWall.classList.add("vertical_wall");
					if (
						!this.htmlBoardTable.rows[i * 2].cells[
							j * 2 + 1
						].hasChildNodes()
					) {
						for (let k = 0; k < 3; k++) {
							this.htmlBoardTable.rows[i * 2 + k].cells[
								j * 2 + 1
							].appendChild(verticalWall.cloneNode(true));
						}
					}
				}
			}
		}
	}

	_renderValidNextWalls() {
		if (this.game.pawnOfTurn.numberOfWalls <= 0) {
			return;
		}

		const onclickNextHorizontalWall = (e) => {
			const x = e.currentTarget;
			View.horizontalWallShadow(x, false);
			const row = (x.parentElement.rowIndex - 1) / 2;
			const col = x.cellIndex / 2;
			this.controller.doMove([null, [row, col], null]);
		};
		const onclickNextVerticalWall = (e) => {
			const x = e.currentTarget;
			View.verticalWallShadow(x, false);
			const row = x.parentElement.rowIndex / 2;
			const col = (x.cellIndex - 1) / 2;
			this.controller.doMove([null, null, [row, col]]);
		};

		for (let i = 0; i < 8; i++) {
			for (let j = 0; j < 8; j++) {
				if (this.game.validNextWalls.horizontal[i][j] === true) {
					let element =
						this.htmlBoardTable.rows[i * 2 + 1].cells[j * 2];
					element.setAttribute(
						"onmouseenter",
						"View.horizontalWallShadow(this, true)"
					);
					element.setAttribute(
						"onmouseleave",
						"View.horizontalWallShadow(this, false)"
					);
					element.onclick = onclickNextHorizontalWall;
				}
				if (this.game.validNextWalls.vertical[i][j] === true) {
					let element =
						this.htmlBoardTable.rows[i * 2].cells[j * 2 + 1];
					element.setAttribute(
						"onmouseenter",
						"View.verticalWallShadow(this, true)"
					);
					element.setAttribute(
						"onmouseleave",
						"View.verticalWallShadow(this, false)"
					);
					element.onclick = onclickNextVerticalWall;
				}
			}
		}
	}

	static horizontalWallShadow(x, turnOn) {
		if (turnOn === true) {
			const _horizontalWallShadow = document.createElement("div");
			_horizontalWallShadow.classList.add("horizontal_wall");
			_horizontalWallShadow.classList.add("shadow");

			x.appendChild(_horizontalWallShadow);
		} else {
			while (x.firstChild) {
				x.removeChild(x.firstChild);
			}
		}
	}

	static verticalWallShadow(x, turnOn) {
		if (turnOn === true) {
			const _verticalWallShadow = document.createElement("div");
			_verticalWallShadow.classList.add("vertical_wall");
			_verticalWallShadow.classList.add("shadow");
			x.appendChild(_verticalWallShadow);
		} else {
			while (x.firstChild) {
				x.removeChild(x.firstChild);
			}
		}
	}

	static removeWalls() {
		let previousWalls = document.querySelectorAll("td > .horizontal_wall");
		for (let i = 0; i < previousWalls.length; i++) {
			previousWalls[i].remove();
		}
		previousWalls = document.querySelectorAll("td > .vertical_wall");
		for (let i = 0; i < previousWalls.length; i++) {
			previousWalls[i].remove();
		}
	}
}
