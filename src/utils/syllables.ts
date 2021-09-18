const syllables = (word: string): number => {
  let temp = word.toLowerCase();
  temp = temp.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  temp = temp.replace(/^y/, '');
  return temp.match(/[aeiouy]{1,2}/g)?.length ?? 0;
};

export default syllables;
