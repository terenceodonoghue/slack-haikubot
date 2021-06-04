require('dotenv-safe').config();
const { App } = require('@slack/bolt');

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

const getSyllables = (word) => {
  word = word.toLowerCase();
  if (word.length <= 3) {
    return 1;
  }
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');
  return word.match(/[aeiouy]{1,2}/g).length;
};

class SyllablesArray extends Array {
  constructor(maxLength) {
    super();
    if (Number.isInteger(maxLength)) {
      this.maxLength = maxLength;
    }
  }

  get syllables() {
    return this.reduce(
      (accumulator, currentValue) => accumulator + getSyllables(currentValue),
      0,
    );
  }

  isValid() {
    return this.syllables === this.maxLength;
  }
}

app.event('message', async ({ message, say }) => {
  const text = SyllablesArray.from(message.text.split(' '));

  if (text.syllables === 17) {
    const haiku = [
      new SyllablesArray(5),
      new SyllablesArray(7),
      new SyllablesArray(5),
    ];

    haiku.forEach((line) => {
      while (text.length > 0 && line.syllables < line.maxLength) {
        line.push(text.shift());
      }

      line.syllables === line.maxLength;
    });

    const isHaiku =
      text.length === 0 && haiku.filter((line) => !line.isValid()).length === 0;

    if (isHaiku) {
      const [firstLine, secondLine, thirdLine] = haiku.map((line) =>
        line.join(' '),
      );

      await say(
        `_${firstLine}_\n_${secondLine}_\n_${thirdLine}_\n- <@${message.user}>`,
      );
    }
  }
});

(async () => {
  await app.start(process.env.PORT || 3000);
  console.log('⚡️ Bolt app is running!');
})();
