const create2DArray = (rows, columns, initialValue = false) =>
	[...Array(rows)].map((row) => Array(columns).fill(initialValue));

const indices2DArray = (arr2D, value) => {
	return arr2D
		.reduce(
			(rows, row, i) => [
				...rows,
				...row
					.map((col, j) => col === value && [i, j])
					.filter((elem) => elem),
			],
			[]
		)
		.filter((elem) => elem.length !== 0);
};

function logicalAndBetween2DArray(arr2DA, arr2DB) {
	const arr2D = [];
	for (let i = 0; i < arr2DA.length; i++) {
		let row = [];
		for (let j = 0; j < arr2DA[0].length; j++) {
			row.push(arr2DA[i][j] && arr2DB[i][j]);
		}
		arr2D.push(row);
	}
	return arr2D;
}

const between = (num, start, end) => num >= start && num <= end;
