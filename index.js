require('dotenv-safe').config();
const {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
} = require('@aws-sdk/client-dynamodb');
const { App } = require('@slack/bolt');

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

(async () => {
  const client = new DynamoDBClient({ region: process.env.AWS_DEFAULT_REGION });

  const app = new App({
    clientId: process.env.SLACK_CLIENT_ID,
    clientSecret: process.env.SLACK_CLIENT_SECRET,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    stateSecret: process.env.SLACK_STATE_SECRET,
    scopes: ['channels:history', 'chat:write'],
    installationStore: {
      storeInstallation: async (installation) => {
        try {
          if (
            installation.isEnterpriseInstall &&
            installation.enterprise !== undefined
          ) {
            const command = new PutItemCommand({
              TableName: process.env.AWS_DYNAMODB_TABLE_NAME,
              Item: {
                installationId: { S: installation.enterprise.id },
                installation: { S: JSON.stringify(installation) },
              },
            });

            return await client.send(command);
          }
          if (installation.team !== undefined) {
            const command = new PutItemCommand({
              TableName: process.env.AWS_DYNAMODB_TABLE_NAME,
              Item: {
                installationId: { S: installation.team.id },
                installation: { S: JSON.stringify(installation) },
              },
            });

            return await client.send(command);
          }
        } catch {
          throw new Error(
            'Failed saving installation data to installationStore',
          );
        }
      },
      fetchInstallation: async (installQuery) => {
        try {
          if (
            installQuery.isEnterpriseInstall &&
            installQuery.enterpriseId !== undefined
          ) {
            const command = new GetItemCommand({
              TableName: process.env.AWS_DYNAMODB_TABLE_NAME,
              Key: {
                installationId: { S: installQuery.enterpriseId },
              },
              ProjectionExpression: 'installation',
            });

            const { Item } = await client.send(command);

            return JSON.parse(Item.installation.S);
          }
          if (installQuery.teamId !== undefined) {
            const command = new GetItemCommand({
              TableName: process.env.AWS_DYNAMODB_TABLE_NAME,
              Key: {
                installationId: { S: installQuery.teamId },
              },
              ProjectionExpression: 'installation',
            });

            const { Item } = await client.send(command);

            return JSON.parse(Item.installation.S);
          }
        } catch {
          throw new Error('Failed fetching installation');
        }
      },
    },
  });

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
      });

      const isHaiku =
        text.length === 0 &&
        haiku.filter((line) => !line.isValid()).length === 0;

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

  await app.start(process.env.PORT || 3000);
  console.log('⚡️ Bolt app is running!');
})();
