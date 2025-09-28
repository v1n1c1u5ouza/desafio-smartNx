// src/server.js
import 'dotenv/config';  

import app from './app.js';

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`API on http://localhost:${port}`));
