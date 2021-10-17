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

const between = (num, start, end) => {
	if (num >= start && num <= end) return true;

	return false;
};
