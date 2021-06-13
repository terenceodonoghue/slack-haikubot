const syllables = (message: string): number => {
  if (message.length <= 3) {
    return 1;
  }

  let temp = message.toLowerCase();
  temp = temp.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  temp = temp.replace(/^y/, '');
  return temp.match(/[aeiouy]{1,2}/g)?.length ?? 0;
};

export default syllables;
