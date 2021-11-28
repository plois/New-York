const pawnMoves = {
	UP: [-1, 0],
	DOWN: [1, 0],
	LEFT: [0, -1],
	RIGHT: [0, 1],
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
	constructor(index, isHuman = true) {
		this.index = index;
		this.side = index;
		this.isHuman = isHuman;
		this.position = null;
		this.goalRow = null;
		this.numberOfWalls = 10;

		if (index === 1) {
			this.goalRow = 0;
			this.position = new Position(8, 4);
		} else {
			this.goalRow = 8;
			this.position = new Position(0, 4);
		}
	}
}
