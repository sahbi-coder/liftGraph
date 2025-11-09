import { z } from 'zod';

const configSchema = z
  .object({
    firebase: z.object({
      apiKey: z.string(),
      authDomain: z.string(),
      projectId: z.string(),
      storageBucket: z.string(),
      messagingSenderId: z.string(),
      appId: z.string(),
    }),
  })
  .readonly();

export type Config = z.infer<typeof configSchema>;

type ConfigInput = {
  firebase: {
    apiKey: string | undefined;
    authDomain: string | undefined;
    projectId: string | undefined;
    storageBucket: string | undefined;
    messagingSenderId: string | undefined;
    appId: string | undefined;
  };
};

export function createConfig(input: ConfigInput): Config {
  return configSchema.parse({
    firebase: {
      apiKey: input.firebase.apiKey,
      authDomain: input.firebase.authDomain,
      projectId: input.firebase.projectId,
      storageBucket: input.firebase.storageBucket,
      messagingSenderId: input.firebase.messagingSenderId,
      appId: input.firebase.appId,
    },
  });
}
