import TestsuiteRunner  from '@typhonjs-build-test/testsuite-runner';

import * as APIErrors   from './tests/APIErrors.js';
import * as WSClientRPC from './tests/WSClientRPC.js';


const data = {
   name: 'WSClientRPC'
};

export default new TestsuiteRunner({
   APIErrors,
   WSClientRPC
}, data);
