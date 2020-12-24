export const ar = {
  move: (arr, from, to) => arr.splice(to, 0, arr.splice(from, 1)[0]),
  shuffle: (arr) => {
    for (let i = arr.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      let temp = arr[i];
      arr[i] = arr[j];
      arr[j] = temp;
    }
  },
  shuff: (arr) =>
    arr.map((v, k) => ar.move(arr, Math.floor(Math.random() * k + 1), k)), //slightly less random
};

export const num = {
  tenth: (number) => parseFloat(number.toFixed(2)),
  clamp: (number, min, max) => Math.min(Math.max(min, number), max)
};
