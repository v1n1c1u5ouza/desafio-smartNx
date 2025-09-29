import app, { init } from './app.js';

const port = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'test') {
  init().then(() => {
    app.listen(port, () => console.log(`API on http://localhost:${port}`));
  });
}

export default app;
