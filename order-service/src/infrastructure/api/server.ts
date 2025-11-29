import { env } from '../../config/env';
import { app } from './express';

const port: number = Number(env.PORT) || 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
