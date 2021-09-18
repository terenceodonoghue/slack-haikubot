import syllables from './syllables';

const checkLine = (line: string): number => {
  let count = 0;

  if (line) {
    const words = line.split(' ');

    words.forEach((word) => {
      count += syllables(word);
    });
  }

  return count;
};

export default checkLine;
