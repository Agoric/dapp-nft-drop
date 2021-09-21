/**
 * Produce an array from startId (inclusive) to startId + numberToBuy (exclusive)
 *
 * E.g. if startId = 2, and numberToBuy is 3, then produce [2, 3, 4]
 *
 * @param {bigint} startId
 * @param {bigint} numberToBuy
 */
const generateIds = (startId, numberToBuy) => {
  const value = [];
  for (let i = startId; i < startId + numberToBuy; i += 1n) {
    value.push(i);
  }
  return value;
};

harden(generateIds);
export { generateIds };
