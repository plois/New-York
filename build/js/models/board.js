class Board {
	constructor(isHuman) {
		this.pawns = isHuman
			? [new Pawn(1, true), new Pawn(2, true)]
			: [new Pawn(1, true), new Pawn(2, false)];
		this.walls = {
			horizontal: create2DArray(8, 8),
			vertical: create2DArray(8, 8),
		};
	}
}
