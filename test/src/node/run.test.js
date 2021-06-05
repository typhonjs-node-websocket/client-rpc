import fs               from 'fs-extra';

import * as Module      from '../../../src/WSClientRPC.js';

import WSTestServer     from '../common/WSTestServer.js';
import TestsuiteRunner  from '../runner/TestsuiteRunner.js';

fs.ensureDirSync('./.nyc_output');
fs.emptyDirSync('./.nyc_output');

fs.ensureDirSync('./coverage');
fs.emptyDirSync('./coverage');

const wsTestServer = new WSTestServer();

describe('', () =>
{
   after(async () =>
   {
      await wsTestServer.shutdown();
   });

   before(async () =>
   {
      await wsTestServer.start();
   });

   TestsuiteRunner.run({ Module });
});


