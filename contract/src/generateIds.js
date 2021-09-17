const createIds = (numberToBuy) => {
  // start with nextId inclusive and make numberToBuy total, up to
  // nextId + numberToBuy (exclusive)
  // if nextId = 2, and numberToBuy is 3, then produce [2, 3, 4]
  const value = [];
  let i = nextId;
  for (i; i < nextId + numberToBuy; i += 1n) {
    value.push(i);
  }
  nextId = i;
  return value;
};
