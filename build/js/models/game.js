class Game {
	constructor(isHuman) {
		this.board = new Board(isHuman);
		this.winner = null;
		this._turn = 0;

		this.validNextWalls = {
			horizontal: create2DArray(8, 8, true),
			vertical: create2DArray(8, 8, true),
		};
		this._probableNextWalls = {
			horizontal: create2DArray(8, 8),
			vertical: create2DArray(8, 8),
		};
		this._probableValidNextWalls = null;
		this._probableValidNextWallsUpdated = false;

		this.openWays = {
			upDown: create2DArray(8, 9, true),
			leftRight: create2DArray(9, 8, true),
		};
		this._validNextPositions = create2DArray(9, 9);
		this._validNextPositionsUpdated = false;
	}

	get turn() {
		return this._turn;
	}

	set turn(newTurn) {
		this._turn = newTurn;
		this._validNextPositionsUpdated = false;
		this._probableValidNextWallsUpdated = false;
	}

	get pawn_1() {
		return this.board.pawns[0];
	}

	get pawn_2() {
		return this.board.pawns[1];
	}

	get pawnIndexOfTurn() {
		return this.turn % 2;
	}

	get pawnIndexOfNotTurn() {
		return (this.turn + 1) % 2;
	}

	get pawnOfTurn() {
		return this.board.pawns[this.pawnIndexOfTurn];
	}

	get pawnOfNotTurn() {
		return this.board.pawns[this.pawnIndexOfNotTurn];
	}

	get probableNextWalls() {
		if (this._probableValidNextWallsUpdated) {
			return this._probableValidNextWalls;
		}
		this._probableValidNextWallsUpdated = true;

		const _probableValidNextWalls = this._probableNextWalls;

		if (this.turn >= 6) {
			for (let i = 0; i < 8; i++) {
				_probableValidNextWalls.horizontal[i][0] = true;
				_probableValidNextWalls.horizontal[i][7] = true;
			}
		}

		if (this.turn >= 3) {
			Game.setWallsBesidePawn(
				_probableValidNextWalls,
				this.pawnOfNotTurn
			);
		}
		if (
			this.turn >= 6 ||
			indices2DArray(this.board.walls.horizontal, true).length > 0 ||
			indices2DArray(this.board.walls.vertical, true).length > 0
		) {
			// support myself
			Game.setWallsBesidePawn(_probableValidNextWalls, this.pawnOfTurn);
		}
		_probableValidNextWalls.horizontal = logicalAndBetween2DArray(
			_probableValidNextWalls.horizontal,
			this.validNextWalls.horizontal
		);
		_probableValidNextWalls.vertical = logicalAndBetween2DArray(
			_probableValidNextWalls.vertical,
			this.validNextWalls.vertical
		);
		this._probableValidNextWalls = _probableValidNextWalls;
		return _probableValidNextWalls;
	}

	get validNextPositions() {
		if (this._validNextPositionsUpdated) return this._validNextPositions;
		this._validNextPositionsUpdated = true;
		this._validNextPositions = create2DArray(9, 9);

		const { UP, DOWN, LEFT, RIGHT } = pawnMoves;

		this.setValidNextPositions(UP, LEFT, RIGHT);
		this.setValidNextPositions(DOWN, LEFT, RIGHT);

		this.setValidNextPositions(LEFT, UP, DOWN);
		this.setValidNextPositions(RIGHT, UP, DOWN);

		return this._validNextPositions;
	}

	setValidNextPositions(mainMove, subMove1, subMove2) {
		if (this.isOpenWay(this.pawnOfTurn.position, mainMove)) {
			let movePosition = this.pawnOfTurn.position.newMove(mainMove);
			if (movePosition.equals(this.pawnOfNotTurn.position)) {
				if (this.isOpenWay(movePosition, mainMove)) {
					let mainMovePosition = movePosition.newMove(mainMove);
					let { row, col } = mainMovePosition;
					this._validNextPositions[row][col] = true;
				} else {
					if (this.isOpenWay(movePosition, subMove1)) {
						let mainSub1MovePosition =
							movePosition.newMove(subMove1);
						let { row, col } = mainSub1MovePosition;
						this._validNextPositions[row][col] = true;
					}
					if (this.isOpenWay(movePosition, subMove2)) {
						let mainSub2MovePosition =
							movePosition.newMove(subMove2);
						let { row, col } = mainSub2MovePosition;
						this._validNextPositions[row][col] = true;
					}
				}
			} else {
				let { row, col } = movePosition;
				this._validNextPositions[row][col] = true;
			}
		}
	}

	// Check if this way is available
	isOpenWay({ row, col }, pawnMoveArr) {
		switch (pawnMoveArr) {
			case pawnMoves.UP:
				return row > 0 && this.openWays.upDown[row - 1][col];
			case pawnMoves.DOWN:
				return row < 8 && this.openWays.upDown[row][col];
			case pawnMoves.LEFT:
				return col > 0 && this.openWays.leftRight[row][col - 1];
			case pawnMoves.RIGHT:
				return col < 8 && this.openWays.leftRight[row][col];

			default:
				throw "pawnMoveArr should be one of UP, DOWN, LEFT, RIGHT";
		}
	}

	movePawn([row, col], needCheck = false) {
		if (needCheck && !this.validNextPositions[row][col]) {
			return false;
		}

		this.pawnOfTurn.position = new Position(row, col);

		if (this.pawnOfTurn.goalRow === this.pawnOfTurn.position.row) {
			this.winner = this.pawnOfTurn;
		}

		this.turn++;

		return true;
	}

	/**
	 * Check if there is a wall near current
	 * @param coords [row, col]
	 * @param ord true | false = horizontal | vertical
	 */
	areNeighbors([row, col], ord) {
		const checkSides = ([x, y], dir) => {
			// check if there is an opposite wall to left/right | top/bottom
			if (dir !== 1 && between(ord ? col + x : row + y, 0, 7)) {
				if (mW[row + (!ord ? y : 0)][col + (ord ? x : 0)]) return true;

				if (between(ord ? row - y : col - x, 0, 7)) {
					if (mW[row + (!ord ? y : -y)][col + (ord ? x : -x)]) {
						return true;
					}
				}

				if (between(ord ? row + y : col + x, 0, 7)) {
					if (mW[row + y][col + x]) return true;
				}
			}

			// check if there is a similar wall to left/right | top/bottom
			if (dir !== 1 && between(ord ? col + 2 * x : row + 2 * y, 0, 7)) {
				if (sW[row + (!ord ? 2 * y : 0)][col + (ord ? 2 * x : 0)]) {
					return true;
				}
			}

			// check if there is a wall to middle of current
			if (dir === 1) {
				if (between(ord ? row - y : col - x, 0, 7)) {
					if (mW[row - (!ord ? 0 : y)][col - (ord ? 0 : x)]) {
						return true;
					}
				}
				if (between(ord ? row + y : col + y, 0, 7)) {
					if (mW[row + (!ord ? 0 : y)][col + (ord ? 0 : x)]) {
						return true;
					}
				}
			}

			return false;
		};

		const { horizontal, vertical } = this.board.walls;
		// mainWalls and subWalls
		const mW = ord ? vertical : horizontal;
		const sW = ord ? horizontal : vertical;

		const touches = [
			(ord ? col === 0 : row === 0) ||
				checkSides(ord ? [-1, 1] : [1, -1], 0),
			checkSides([1, 1], 1),
			(ord ? col === 7 : row === 7) || checkSides([1, 1], 2),
		];

		return touches;
	}

	/**
	 * Check if path to goal lines still exists after placing wall
	 * @param coords [row, col]
	 * @param ord true | false = horizontal | vertical
	 */
	isExistPathAfterPlaceWall([row, col], ord) {
		if (this.areNeighbors([row, col], ord).filter((n) => n).length < 2) {
			return true;
		}

		if (ord) {
			this.openWays.upDown[row][col] = false;
			this.openWays.upDown[row][col + 1] = false;
		} else {
			this.openWays.leftRight[row][col] = false;
			this.openWays.leftRight[row + 1][col] = false;
		}

		const result = this._existPaths();

		if (ord) {
			this.openWays.upDown[row][col] = true;
			this.openWays.upDown[row][col + 1] = true;
		} else {
			this.openWays.leftRight[row][col] = true;
			this.openWays.leftRight[row + 1][col] = true;
		}

		return result;
	}

	adjustProbableValidNextWallForAfterPlaceHorizontalWall(row, col) {
		if (row >= 1) {
			this._probableNextWalls.vertical[row - 1][col] = true;
		}
		if (row <= 6) {
			this._probableNextWalls.vertical[row + 1][col] = true;
		}
		if (col >= 1) {
			this._probableNextWalls.vertical[row][col - 1] = true;
			if (row >= 1) {
				this._probableNextWalls.vertical[row - 1][col - 1] = true;
			}
			if (row <= 6) {
				this._probableNextWalls.vertical[row + 1][col - 1] = true;
			}
			if (col >= 2) {
				this._probableNextWalls.horizontal[row][col - 2] = true;
				this._probableNextWalls.vertical[row][col - 2] = true;
				if (col >= 3) {
					this._probableNextWalls.horizontal[row][col - 3] = true;
				}
			}
		}
		if (col <= 6) {
			this._probableNextWalls.vertical[row][col + 1] = true;
			if (row >= 1) {
				this._probableNextWalls.vertical[row - 1][col + 1] = true;
			}
			if (row <= 6) {
				this._probableNextWalls.vertical[row + 1][col + 1] = true;
			}
			if (col <= 5) {
				this._probableNextWalls.horizontal[row][col + 2] = true;
				this._probableNextWalls.vertical[row][col + 2] = true;
				if (col <= 4) {
					this._probableNextWalls.horizontal[row][col + 3] = true;
				}
			}
		}
	}

	adjustProbableValidNextWallForAfterPlaceVerticalWall(row, col) {
		if (col >= 1) {
			this._probableNextWalls.horizontal[row][col - 1] = true;
		}
		if (col <= 6) {
			this._probableNextWalls.horizontal[row][col + 1] = true;
		}
		if (row >= 1) {
			this._probableNextWalls.horizontal[row - 1][col] = true;
			if (col >= 1) {
				this._probableNextWalls.horizontal[row - 1][col - 1] = true;
			}
			if (col <= 6) {
				this._probableNextWalls.horizontal[row - 1][col + 1] = true;
			}
			if (row >= 2) {
				this._probableNextWalls.vertical[row - 2][col] = true;
				this._probableNextWalls.horizontal[row - 2][col] = true;
				if (row >= 3) {
					this._probableNextWalls.vertical[row - 3][col] = true;
				}
			}
		}
		if (row <= 6) {
			this._probableNextWalls.horizontal[row + 1][col] = true;
			if (col >= 1) {
				this._probableNextWalls.horizontal[row + 1][col - 1] = true;
			}
			if (col <= 6) {
				this._probableNextWalls.horizontal[row + 1][col + 1] = true;
			}
			if (row <= 5) {
				this._probableNextWalls.vertical[row + 2][col] = true;
				this._probableNextWalls.horizontal[row + 2][col] = true;
				if (row <= 4) {
					this._probableNextWalls.vertical[row + 3][col] = true;
				}
			}
		}
	}

	placeHorizontalWall([row, col], needCheck = false) {
		if (needCheck && !this.isExistPathAfterPlaceWall([row, col], true)) {
			return false;
		}

		this.openWays.upDown[row][col] = false;
		this.openWays.upDown[row][col + 1] = false;
		this.validNextWalls.vertical[row][col] = false;
		this.validNextWalls.horizontal[row][col] = false;

		if (col > 0) {
			this.validNextWalls.horizontal[row][col - 1] = false;
		}
		if (col < 7) {
			this.validNextWalls.horizontal[row][col + 1] = false;
		}

		this.board.walls.horizontal[row][col] = true;
		// this.adjustProbableValidNextWallForAfterPlaceHorizontalWall(row, col);
		this.pawnOfTurn.numberOfWalls--;
		this.turn++;
		return true;
	}

	placeVerticalWall([row, col], needCheck = false) {
		if (needCheck && !this.isExistPathAfterPlaceWall([row, col], false)) {
			return false;
		}

		this.openWays.leftRight[row][col] = false;
		this.openWays.leftRight[row + 1][col] = false;
		this.validNextWalls.horizontal[row][col] = false;
		this.validNextWalls.vertical[row][col] = false;

		if (row > 0) {
			this.validNextWalls.vertical[row - 1][col] = false;
		}
		if (row < 7) {
			this.validNextWalls.vertical[row + 1][col] = false;
		}

		this.board.walls.vertical[row][col] = true;
		// this.adjustProbableValidNextWallForAfterPlaceHorizontalWall(row, col);
		this.pawnOfTurn.numberOfWalls--;
		this.turn++;
		return true;
	}

	isPossibleMove(move) {
		let kindOfMove = null;
		const coords = move.find((coords, index) => {
			if (coords) {
				kindOfMove = index;
				return coords;
			}
		});

		if (!coords) return false;

		const [row, col] = coords;

		switch (kindOfMove) {
			case 0:
				return this.validNextPositions[row][col];
			case 1:
				return this.placeHorizontalWall(coords, needCheck);
			case 2:
				return this.placeVerticalWall(coords, needCheck);

			default:
				throw "There is no such type of move";
		}
	}

	doMove(move, needCheck = false) {
		if (this.winner) {
			console.log("error: doMove after already terminal......");
		}

		let kindOfMove = null;
		const coords = move.find((coords, index) => {
			if (coords) {
				kindOfMove = index;
				return coords;
			}
		});

		switch (kindOfMove) {
			case 0:
				return this.movePawn(coords, needCheck);
			case 1:
				return this.placeHorizontalWall(coords, needCheck);
			case 2:
				return this.placeVerticalWall(coords, needCheck);

			default:
				throw "There is no such type of move";
		}
	}

	_existPaths() {
		return (
			this._existPath(this.pawnOfTurn) &&
			this._existPath(this.pawnOfNotTurn)
		);
	}

	_existPath(pawn) {
		const visited = create2DArray(9, 9);
		const depthFirstSearch = (position, goalRow) => {
			for (const [key, move] of Object.entries(pawnMoves)) {
				const pawnPosition = new Position(position.row, position.col);
				if (this.isOpenWay(position, move)) {
					const nextPosition = pawnPosition.newMove(move);
					const { row, col } = nextPosition.position;
					if (!visited[row][col]) {
						visited[row][col] = true;

						if (row === goalRow) return true;

						if (depthFirstSearch(nextPosition.position, goalRow)) {
							return true;
						}
					}
				}
			}

			return false;
		};

		return depthFirstSearch(pawn.position, pawn.goalRow);
	}

	static setWallsBesidePawn(wall2DArrays, pawn) {
		const { row, col } = pawn.position;
		if (row >= 1) {
			if (col >= 1) {
				wall2DArrays.horizontal[row - 1][col - 1] = true;
				wall2DArrays.vertical[row - 1][col - 1] = true;
				if (col >= 2) {
					wall2DArrays.horizontal[row - 1][col - 2] = true;
				}
			}
			if (col <= 7) {
				wall2DArrays.horizontal[row - 1][col] = true;
				wall2DArrays.vertical[row - 1][col] = true;
				if (col <= 6) {
					wall2DArrays.horizontal[row - 1][col + 1] = true;
				}
			}
			if (row >= 2) {
				if (col >= 1) {
					wall2DArrays.vertical[row - 2][col - 1] = true;
				}
				if (col <= 7) {
					wall2DArrays.vertical[row - 2][col] = true;
				}
			}
		}
		if (row <= 7) {
			if (col >= 1) {
				wall2DArrays.horizontal[row][col - 1] = true;
				wall2DArrays.vertical[row][col - 1] = true;
				if (col >= 2) {
					wall2DArrays.horizontal[row][col - 2] = true;
				}
			}
			if (col <= 7) {
				wall2DArrays.horizontal[row][col] = true;
				wall2DArrays.vertical[row][col] = true;
				if (col <= 6) {
					wall2DArrays.horizontal[row][col + 1] = true;
				}
			}
			if (row <= 6) {
				if (col >= 1) {
					wall2DArrays.vertical[row + 1][col - 1] = true;
				}
				if (col <= 7) {
					wall2DArrays.vertical[row + 1][col] = true;
				}
			}
		}
	}
}
