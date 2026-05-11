import { app } from './app';
import { env } from './config/env';
import { startRubeusRetryJob } from './jobs/rubeusRetryJob';

startRubeusRetryJob();

app.listen(env.port, () => {
  console.log(`Server is running on port ${env.port}`);
});
