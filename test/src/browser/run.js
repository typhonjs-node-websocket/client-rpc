import TestRunner    from '@typhonjs-utils/build-test-browser';

import WSTestServer  from '../common/WSTestServer.js';

/**
 * Provides the main async execution function
 *
 * @returns {Promise<void>} A Promise
 */
async function main()
{
   const wsTestServer = new WSTestServer();
   await wsTestServer.start();

   await TestRunner.runServerAndTestSuite({
      reportDir: './coverage-browser',
      // keepAlive: true   // Uncomment to keep HTTP server alive / useful for testing other browsers.
   });

   await wsTestServer.shutdown();
}

main().catch((err) =>
{
   console.log(err);
   process.exit(1);
});
