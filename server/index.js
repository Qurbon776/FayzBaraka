import { app } from './app.js';

const port = Number(process.env.PORT || 3001);

app.listen(port, () => {
  console.log(`FAYZ BARAKA API listening on http://127.0.0.1:${port}`);
});
