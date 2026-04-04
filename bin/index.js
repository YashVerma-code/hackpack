#!/usr/bin/env node

import { App } from '../src/core/App.js';

const app = new App();
app.run().catch(err => {
  console.error(err);
  process.exit(1);
});
