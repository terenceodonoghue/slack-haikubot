import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
} from '@aws-sdk/client-dynamodb';
import { App } from '@slack/bolt';
import * as dotenv from 'dotenv-safe';
import { Haiku } from './classes';

dotenv.config();

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

            await client.send(command);
          }
          if (installation.team !== undefined) {
            const command = new PutItemCommand({
              TableName: process.env.AWS_DYNAMODB_TABLE_NAME,
              Item: {
                installationId: { S: installation.team.id },
                installation: { S: JSON.stringify(installation) },
              },
            });

            await client.send(command);
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

            if (Item?.installation.S) {
              return JSON.parse(Item?.installation.S);
            }
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

            if (Item?.installation.S) {
              return JSON.parse(Item?.installation.S);
            }
          }

          return null;
        } catch {
          throw new Error('Failed fetching installation');
        }
      },
    },
  });

  app.event('message', async ({ message, say }) => {
    // @ts-ignore
    if (Haiku.validate(message.text)) {
      // @ts-ignore
      const haiku = new Haiku(message.text, message.user);

      if (haiku.isValid()) {
        await say(haiku.toString());
      }
    }
  });

  const port = process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 3000;

  await app.start(port);
  console.log('⚡️ Bolt app is running!');
})();
