class Board {
	constructor() {
		this.pawns = [new Pawn(1, true), new Pawn(2, true)];
		this.walls = {
			horizontal: create2DArray(8, 8),
			vertical: create2DArray(8, 8),
		};
	}
}
