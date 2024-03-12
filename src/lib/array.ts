export const swap = <T>(array: T[], index1: number, index2: number): T[] => {
	array[index1] = array.splice(index2, 1, array[index1])[0];
	return array;
};
