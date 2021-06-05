/**
 * @param {object}                        opts - Test options
 *
 * @param {import('../../../../types')}   opts.Module - Module to test
 *
 * @param {object}                        opts.data - Extra test data.
 *
 * @param {object}                        opts.env - Test environment variables
 *
 * @param {object}                        opts.chai - Chai
 */
export function run({ Module, data, env, chai })
{
   const { expect } = chai;

   const WSClientRPC = Module.default;

   describe(`API Errors (${data.scopedName}):`, () =>
   {
      describe('connect:', () =>
      {
         it(`'timeout' must be a positive integer.`, async () =>
         {
            const socket = new WSClientRPC({ port: 8001 });

            // should be `Cannot read property 'timeout' of null`, but on Node 12.0.0 a different error message prints
            await expect(socket.connect(null)).to.be.rejectedWith(TypeError);
         });

         it(`'timeout' must be a positive integer. (< 0)`, async () =>
         {
            const socket = new WSClientRPC({ port: 8001 });

            await expect(socket.connect({ timeout: -1 })).to.be.rejectedWith(TypeError,
             `'timeout' must be a positive integer.`);
         });

         it(`'timeout' must be a positive integer. (bad type)`, async () =>
         {
            const socket = new WSClientRPC({ port: 8001 });

            await expect(socket.connect({ timeout: false })).to.be.rejectedWith(TypeError,
             `'timeout' must be a positive integer.`);
         });
      });

      describe('setClientOptions:', () =>
      {
         it(`'clientOptions' is null or undefined.`, () =>
         {
            expect(() => new WSClientRPC(null)).to.throw(TypeError,
             `'clientOptions' is null or undefined.`);
         });

         it(`'clientOptions' is not an object.`, () =>
         {
            expect(() => new WSClientRPC(false)).to.throw(TypeError,
             `'clientOptions' is not an object.`);
         });

         it(`'clientOptions.url' is not a string or URL.`, () =>
         {
            expect(() => new WSClientRPC({ url: false })).to.throw(TypeError,
             `'clientOptions.url' is not a string or URL.`);
         });

         it(`'clientOptions.url' is not a WebSocket URL.`, () =>
         {
            expect(() => new WSClientRPC({ url: 'https://bad.com' })).to.throw(TypeError,
             `'clientOptions.url' is not a WebSocket URL.`);
         });

         it(`'clientOptions.port' is not an integer between [0-65535]. (not integer)`, () =>
         {
            expect(() => new WSClientRPC({ port: false })).to.throw(TypeError,
             `'clientOptions.port' is not an integer between [0-65535].`);
         });

         it(`'clientOptions.port' is not an integer between [0-65535]. (< 0)`, () =>
         {
            expect(() => new WSClientRPC({ port: -1 })).to.throw(TypeError,
             `'clientOptions.port' is not an integer between [0-65535].`);
         });

         it(`'clientOptions.port' is not an integer between [0-65535]. (> 65535)`, () =>
         {
            expect(() => new WSClientRPC({ port: 65536 })).to.throw(TypeError,
             `'clientOptions.port' is not an integer between [0-65535].`);
         });

         it(`'clientOptions.host' is not a string.`, () =>
         {
            expect(() => new WSClientRPC({ port: 0, host: false })).to.throw(TypeError,
             `'clientOptions.host' is not a string.`);
         });

         it(`'clientOptions.ssl' is not a boolean.`, () =>
         {
            expect(() => new WSClientRPC({ port: 0,  ssl: 0 })).to.throw(TypeError,
             `'clientOptions.ssl' is not a boolean.`);
         });

         it(`'clientOptions.binaryType' must be 'blob' or 'arraybuffer'. (not string)`, () =>
         {
            expect(() => new WSClientRPC({ port: 0,  binaryType: false })).to.throw(TypeError,
             `'clientOptions.binaryType' must be 'blob' or 'arraybuffer'.`);
         });

         it(`'clientOptions.binaryType' must be 'blob' or 'arraybuffer'. (not 'blob' / 'arraybuffer')`, () =>
         {
            expect(() => new WSClientRPC({ port: 0,  binaryType: 'bad' })).to.throw(TypeError,
             `'clientOptions.binaryType' must be 'blob' or 'arraybuffer'.`);
         });

         it(`'clientOptions.serializer' does not conform to the JSON API. (not object)`, () =>
         {
            expect(() => new WSClientRPC({ port: 0,  serializer: 'bad' })).to.throw(TypeError,
             `'clientOptions.serializer' does not conform to the JSON API.`);
         });

         it(`'clientOptions.serializer' does not conform to the JSON API. (missing stringify)`, () =>
         {
            expect(() => new WSClientRPC({ port: 0, serializer: { parse: () => {} } })).to.throw(TypeError,
             `'clientOptions.serializer' does not conform to the JSON API.`);
         });

         it(`'clientOptions.serializer' does not conform to the JSON API. (missing parse)`, () =>
         {
            expect(() => new WSClientRPC({ port: 0, serializer: { stringify: () => {} } })).to.throw(TypeError,
             `'clientOptions.serializer' does not conform to the JSON API.`);
         });

         it(`'clientOptions.autoConnect' is not a boolean.`, () =>
         {
            expect(() => new WSClientRPC({ port: 0, autoConnect: 0 })).to.throw(TypeError,
               `'clientOptions.autoConnect' is not a boolean.`);
         });

         it(`'clientOptions.autoReconnect' is not a boolean.`, () =>
         {
            expect(() => new WSClientRPC({ port: 0, autoReconnect: 0 })).to.throw(TypeError,
             `'clientOptions.autoReconnect' is not a boolean.`);
         });

         it(`'clientOptions.connectTimeout' is not an integer or < 0. (not number)`, () =>
         {
            expect(() => new WSClientRPC({ port: 0, connectTimeout: false })).to.throw(TypeError,
             `'clientOptions.connectTimeout' is not an integer or < 0.`);
         });

         it(`'clientOptions.connectTimeout' is not an integer or < 0. (< 0)`, () =>
         {
            expect(() => new WSClientRPC({ port: 0, connectTimeout: -1 })).to.throw(TypeError,
             `'clientOptions.connectTimeout' is not an integer or < 0.`);
         });

         it(`'clientOptions.messageTimeout' is not an integer or < 0. (not number)`, () =>
         {
            expect(() => new WSClientRPC({ port: 0, messageTimeout: false })).to.throw(TypeError,
             `'clientOptions.messageTimeout' is not an integer or < 0.`);
         });

         it(`'clientOptions.messageTimeout' is not an integer or < 0. (< 0)`, () =>
         {
            expect(() => new WSClientRPC({ port: 0, messageTimeout: -1 })).to.throw(TypeError,
             `'clientOptions.messageTimeout' is not an integer or < 0.`);
         });

         it(`'clientOptions.reconnectInterval' is not an integer or < 0. (not number)`, () =>
         {
            expect(() => new WSClientRPC({ port: 0, reconnectInterval: false })).to.throw(TypeError,
             `'clientOptions.reconnectInterval' is not an integer or < 0.`);
         });

         it(`'clientOptions.reconnectInterval' is not an integer or < 0. (< 0)`, () =>
         {
            expect(() => new WSClientRPC({ port: 0, reconnectInterval: -1 })).to.throw(TypeError,
             `'clientOptions.reconnectInterval' is not an integer or < 0.`);
         });

         it(`'clientOptions.path' is not a string.`, () =>
         {
            expect(() => new WSClientRPC({ port: 0, path: false })).to.throw(TypeError,
             `'clientOptions.path' is not a string.`);
         });

         it(`'clientOptions.protocol' is not a string or string[].`, () =>
         {
            expect(() => new WSClientRPC({ port: 0, protocol: false })).to.throw(TypeError,
             `'clientOptions.protocol' is not a string or string[].`);
         });

         it(`'clientOptions.trigger' is not a boolean.`, () =>
         {
            expect(() => new WSClientRPC({ port: 0, trigger: 0 })).to.throw(TypeError,
             `'clientOptions.trigger' is not a boolean.`);
         });
      });

      if (env.isNode)
      {
         describe('wsOptions', () =>
         {
            it(`'wsOptions' is not an object.`, () =>
            {
               expect(() => new WSClientRPC({ port: 8001 }, false)).to.throw(TypeError, `'wsOptions' is not an object.`);
            });

            it(`'wsOptions' is not an object. (reconnect)`, async () =>
            {
               const socket = new WSClientRPC({ port: 8001 });

               await socket.connect();

               await expect(socket.reconnect({ wsOptions: false })).to.be.rejectedWith(TypeError,
                `'wsOptions' is not an object.`);
            });
         });
      }
   });
}
