const syllables = (message: string) => {
  message = message.toLowerCase();
  if (message.length <= 3) {
    return 1;
  }
  message = message.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  message = message.replace(/^y/, '');
  return message.match(/[aeiouy]{1,2}/g)?.length ?? 0;
};

export default syllables;
