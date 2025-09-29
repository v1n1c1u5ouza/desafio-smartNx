const fs = require('fs');
const dotenv = require('dotenv');

if (fs.existsSync('.env.test')) {
  dotenv.config({ path: '.env.test' });
} else {
  dotenv.config();
}
