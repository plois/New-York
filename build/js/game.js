const pawnMoves = {
	UP: [-1, 0],
	DOWN: [1, 0],
	LEFT: [0, -1],
	RIGHT: [0, 1],
};

const create2DArray = (rows, columns, initialValue = false) => {
	const arr2D = [];
	for (let i = 0; i < rows; i++) {
		let row = [];
		for (let j = 0; j < columns; j++) {
			row.push(initialValue);
		}
		arr2D.push(row);
	}
	return arr2D;
};

class Position {
	constructor(row, col) {
		this.row = row;
		this.col = col;
	}

	get position() {
		return { row: this.row, col: this.col };
	}

	newMove([row, col]) {
		return new Position(this.row + row, this.col + col);
	}

	equals({ row, col }) {
		return this.row === row && this.col === col;
	}
}

class Pawn {
	constructor(index, isHuman) {
		this.index = index;
		this.isHuman = isHuman;
		this.side = index;
		this.position = null;
		this.goalRow = null;
		this.numberOfWalls = 10;

		if (index === 0) {
			this.goalRow = 0;
			this.position = new Position(8, 4);
			// this.position = {
			// 	row: 8,
			// 	col: 4,
			// };
		} else {
			this.goalRow = 8;
			this.position = new Position(0, 4);
			// this.position = {
			// 	row: 0,
			// 	col: 4,
			// };
		}
	}
}

class Board {
	constructor() {
		this.pawns = [new Pawn(0, true), new Pawn(1, true)];
		this.walls = {
			horizontal: create2DArray(8, 8),
			vertical: create2DArray(8, 8),
		};
	}
}

class Game {
	constructor() {
		this.board = new Board();
		this.winner = null;
		this.turn = 0;

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

	setTurn(newTurn) {
		this.turn = newTurn;
		this._validNextPositionsUpdated = false;
		this._probableValidNextWallsUpdated = false;
	}

	get pawn0() {
		return this.board.pawns[0];
	}

	get pawn1() {
		return this.board.pawns[1];
	}

	get pawnOfTurn() {
		return this.board.pawns[this.turn % 2];
	}

	get pawnOfNotTurn() {
		return this.board.pawns[(this.turn + 1) % 2];
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
			// mainMovePosition: the pawn's position after main move

			let movePosition = this.pawnOfTurn.position.newMove(mainMove);
			// if the other pawn is on the position after main move (e.g. up)
			if (movePosition.equals(this.pawnOfNotTurn.position)) {
				// check for jumping toward main move (e.g. up) direction
				if (this.isOpenWay(movePosition, mainMove)) {
					// mainmovePosition: the pawn's position after two main move
					let mainMovePosition = movePosition.newMove(mainMove);
					this._validNextPositions[mainMovePosition.row][
						mainMovePosition.col
					] = true;
				} else {
					// check for jumping toward sub move 1 (e.g. left) direction
					if (this.isOpenWay(mainMovePosition, subMove1)) {
						// mainSub1MovePosition: the pawn's position after (main move + sub move 1)
						let mainSub1MovePosition =
							mainMovePosition.newAddMove(subMove1);
						this._validNextPositions[mainSub1MovePosition.row][
							mainSub1MovePosition.col
						] = true;
					}
					// check for jumping toward sub move 2 (e.g. right) direction
					if (this.isOpenWay(mainMovePosition, subMove2)) {
						// mainSub2MovePosition: the pawn's position after (main move + sub move 2)
						let mainSub2MovePosition =
							mainMovePosition.newMove(subMove2);
						this._validNextPositions[mainSub2MovePosition.row][
							mainSub2MovePosition.col
						] = true;
					}
				}
			} else {
				this._validNextPositions[movePosition.row][
					movePosition.col
				] = true;
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

	placeHorizontalWall([row, col], needCheck = false) {
		// if (needCheck && !this.testIfExistPathsToGoalLinesAfterPlaceHorizontalWall(row, col)) {
		if (needCheck) {
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
		// if (needCheck && !this.testIfExistPathsToGoalLinesAfterPlaceVerticalWall(row, col)) {
		if (needCheck) {
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
				return this.placeHorizontalWallAt(coords, needCheck);
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
				return this.placeHorizontalWallAt(coords, needCheck);
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
		// const {UP, DOWN, LEFT, RIGHT} = pawnMoves;
		// const pawnMoveTuples = [MOVE_UP, MOVE_LEFT, MOVE_RIGHT, MOVE_DOWN];
		const depthFirstSearch = (position, goalRow) => {
			// const pawnPosition = new Position(position.row, position.col);

			for (const [key, move] of Object.entries(pawnMoves)) {
				const pawnPosition = new Position(position.row, position.col);
				if (this.isOpenWay(position, move)) {
					const nextPosition = pawnPosition.newMove(move);
					const { row, col } = nextPosition.position;
					console.log(row, col);
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
			// for (const pawnMoveTuple of pawnMoveTuples) {
			// 	if (this.isOpenWay(currentRow, currentCol, pawnMoveTuple)) {
			// 		const nextRow = currentRow + pawnMoveTuple[0];
			// 		const nextCol = currentCol + pawnMoveTuple[1];
			// 		if (!visited[nextRow][nextCol]) {
			// 			visited[nextRow][nextCol] = true;
			// 			if (nextRow === goalRow) {
			// 				return true;
			// 			}
			// 			if (
			// 				depthFirstSearch.bind(this)(
			// 					nextRow,
			// 					nextCol,
			// 					goalRow
			// 				)
			// 			) {
			// 				return true;
			// 			}
			// 		}
			// 	}
			// }
			// return false;
		};

		return depthFirstSearch(pawn.position, pawn.goalRow);
	}

	// static setWallsBesidePawn(wall2DArrays, pawn) {
	// 	const { row, col } = pawn.position;
	// 	if (row >= 1) {
	//         if (col >= 1) {
	//             wall2DArrays.horizontal[row-1][col-1] = true;
	//             wall2DArrays.vertical[row-1][col-1] = true;
	//             if (col >= 2) {
	//                 wall2DArrays.horizontal[row-1][col-2] = true;
	//             }
	//         }
	//         if (col <= 7) {
	//             wall2DArrays.horizontal[row-1][col] = true;
	//             wall2DArrays.vertical[row-1][col] = true;
	//             if (col <= 6) {
	//                 wall2DArrays.horizontal[row-1][col+1] = true;
	//             }
	//         }
	//         if (row >= 2) {
	//             if (col >= 1) {
	//                 wall2DArrays.vertical[row-2][col-1] = true;
	//             }
	//             if (col <= 7) {
	//                 wall2DArrays.vertical[row-2][col] = true;
	//             }
	//         }
	//     }
	//     if (row <= 7) {
	//         if (col >= 1) {
	//             wall2DArrays.horizontal[row][col-1] = true;
	//             wall2DArrays.vertical[row][col-1] = true;
	//             if (col >= 2) {
	//                 wall2DArrays.horizontal[row][col-2] = true;
	//             }
	//         }
	//         if (col <= 7) {
	//             wall2DArrays.horizontal[row][col] = true;
	//             wall2DArrays.vertical[row][col] = true;
	//             if (col <= 6) {
	//                 wall2DArrays.horizontal[row][col+1] = true;
	//             }
	//         }
	//         if (row <= 6) {
	//             if (col >= 1) {
	//                 wall2DArrays.vertical[row+1][col-1] = true;
	//             }
	//             if (col <= 7) {
	//                 wall2DArrays.vertical[row+1][col] = true;
	//             }
	//         }
	//     }
	// }
}

const game = new Game();
// console.log(game.isOpenWay(game.pawn1.position, pawnMoves.UP));
game.movePawn(pawnMoves.UP);
// console.log(game._existPath(new Pawn(0, true)));

const a = [1, 1];
const b = ([row, col]) => {
	return { row: 1 + row, col: 1 + col };
};

// console.log(b(a));

// const position = new Position(0, 0);
// const position1 = position.newMove([1, 1]);
// console.log(position);
// console.log(position1)

game.placeHorizontalWall([7, 3]);
game.placeHorizontalWall([7, 1]);
game.placeVerticalWall([7, 0]);
console.log(game._existPath(new Pawn(0, true)));
