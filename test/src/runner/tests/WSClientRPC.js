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
   const { assert, expect } = chai;

   const WSClientRPC = Module.default;

   const options = (config = {}) => Object.assign({ port: 8001 }, config);

   describe(`WSClient (${data.scopedName}):`, () =>
   {
      describe(`socket events:`, () =>
      {
         let socket;

         afterEach(() =>
         {
            socket.disconnect();
         });

         beforeEach(() =>
         {
            socket = new WSClientRPC({ port: 8001, binaryType: 'arraybuffer' });
         });

         it('socket:open', (done) =>
         {
            socket.connect();
            socket.on('socket:open', () => { done(); });
         });

         it('socket:close', (done) =>
         {
            socket.connect();
            socket.on('socket:open', () => socket.disconnect());
            socket.on('socket:close', () => { done(); });
         });

         it('socket:error (bad subprotocol)', (done) =>
         {
            socket = new WSClientRPC(options({ protocol: 'foobar' }));
            socket.connect();
            socket.on('socket:error', (event) =>
            {
               assert.strictEqual(event.type, 'error');
               done();
            });
         });

         it('socket:message:in (object)', (done) =>
         {
            socket.connect();
            socket.on('socket:open', () => socket.send({ msg: 'echo', id: 5 }));
            socket.on('socket:message:in', (data) =>
            {
               assert.isObject(data);
               assert.strictEqual(data.msg, 'echo');
               assert.strictEqual(data.id, 5);
               done();
            });
         });

         it('socket:message:in (Int8Array)', (done) =>
         {
            socket.connect();

            const outData = new Int8Array([1, 2, 3]);

            socket.on('socket:open', () => socket.send(outData));
            socket.on('socket:message:in', (data) =>
            {
               assert.isTrue(data instanceof ArrayBuffer);

               const view = new DataView(data);

               assert.strictEqual(view.getInt8(0), 1);
               assert.strictEqual(view.getInt8(1), 2);
               assert.strictEqual(view.getInt8(2), 3);

               done();
            });
         });

         it('socket:message:in (not JSON)', (done) =>
         {
            socket.connect();
            socket.on('socket:open', () => socket.send({ msg: 'not-json' }));
            socket.on('socket:message:in', (data) =>
            {
               assert.isString(data);
               assert.strictEqual(data, 'Not JSON');
               done();
            });
         });

         it('sendAll / socket:message:in (object)', (done) =>
         {
            let cntr = 0;

            socket.connect();

            socket.on('socket:open', () =>
            {
               const outData = new Int8Array([1, 2, 3]);

               // Send mixed messages / object + data.
               socket.sendAll([{ msg: 'echo', id: 5 }, outData, { msg: 'echo', id: 15 }]);
            });

            socket.on('socket:message:in', (data) =>
            {
               switch (cntr)
               {
                  case 0:
                     assert.isObject(data);
                     assert.strictEqual(data.msg, 'echo');
                     assert.strictEqual(data.id, 5);
                     cntr++;
                     break;
                  case 1:
                     assert.isTrue(data instanceof ArrayBuffer);
                     cntr++;
                     break;
                  case 2:
                     assert.isObject(data);
                     assert.strictEqual(data.msg, 'echo');
                     assert.strictEqual(data.id, 15);
                     done();
                     break;
               }
            });
         });

         it('queue / socket:message:in (object)', (done) =>
         {
            let cntr = 0;

            // To hit the else branch of the default consumer function of queue.
            socket.queue.process();

            // Push three messages that are processed once connected.
            socket.queue.push({ msg: 'echo', id: 5 });
            socket.queue.pushAll([{ msg: 'echo', id: 10 }, { msg: 'echo', id: 15 }]);

            socket.connect();

            socket.on('socket:message:in', (data) =>
            {
               assert.isObject(data);
               assert.strictEqual(data.msg, 'echo');

               switch (cntr)
               {
                  case 0:
                     assert.strictEqual(data.id, 5);
                     cntr++;
                     break;
                  case 1:
                     assert.strictEqual(data.id, 10);
                     cntr++;
                     break;
                  case 2:
                     assert.strictEqual(data.id, 15);
                     done();
                     break;
               }
            });
         });
      });

      describe(`clientOptions:`, () =>
      {
         let socket;

         afterEach(() =>
         {
            socket.disconnect();
         });

         it('autoConnect', (done) =>
         {
            socket = new WSClientRPC(options({ autoConnect: true }));
            socket.on('socket:open', () => { done(); });
         });

         it('autoReconnect', (done) =>
         {
            socket = new WSClientRPC(options({ autoReconnect: true, reconnectInterval: 500 }));

            socket.connect();

            socket.once('socket:open', () => socket.send({ msg: 'close' }));

            socket.once('socket:close', () =>
            {
               socket.once('socket:open', () =>
               {
                  socket.clientOptions.autoReconnect = false;
                  done();
               });
            });
         });

         it('path', (done) =>
         {
            socket = new WSClientRPC(options({ path: 'ws' }));
            socket.connect();
            socket.on('socket:open', () => { done(); });
         });

         it('protocol', (done) =>
         {
            socket = new WSClientRPC(options({ protocol: 'foo' }));
            socket.connect();
            socket.on('socket:open', () => { done(); });
         });
      });

      describe(`methods:`, () =>
      {
         let socket;

         afterEach(() =>
         {
            socket.disconnect();
         });

         it(`'clientOptions' is null or undefined.`, async () =>
         {
            socket = new WSClientRPC();

            await expect(socket.connect()).to.be.rejectedWith(`WSClient [connect] 'clientOptions' has not been set.`);
         });

         it('connect (multiple times)', async () =>
         {
            socket = new WSClientRPC(options());

            await socket.connect();
            await expect(socket.connect()).to.be.rejectedWith('WSClient [connect] already created WebSocket.');
         });

         it('connect (no server)', async () =>
         {
            socket = new WSClientRPC({ port: 8002 });

            // The error is different for Node & browser so just check for rejection.
            await expect(socket.connect()).to.be.rejectedWith();
         });

         it('connect (multiple times)', async () =>
         {
            socket = new WSClientRPC(options());

            socket.connect();
            await expect(socket.connect()).to.be.rejectedWith();
         });

         it('connect w/ options', (done) =>
         {
            socket = new WSClientRPC();

            socket.connect({ clientOptions: options(), wsOptions: {} });
            socket.on('socket:open', () => { done(); });
         });

         it('connect w/ setOptions', (done) =>
         {
            socket = new WSClientRPC();

            socket.setOptions({ clientOptions: options(), wsOptions: {} });

            socket.connect();
            socket.on('socket:open', () => { done(); });
         });

         it('connect / disconnect (await)', async () =>
         {
            socket = new WSClientRPC(options());

            await socket.connect();
            await socket.disconnect();
            await socket.connect();
            await socket.disconnect();
         });

         it('disconnect (before connect)', async () =>
         {
            socket = new WSClientRPC(options());

            socket.connect();

            // The error is different for Node & browser so just check for rejection.
            await expect(socket.disconnect()).to.be.rejectedWith();
         });

         it('get bufferedAmount', (done) =>
         {
            socket = new WSClientRPC(options());

            assert.strictEqual(socket.bufferedAmount, 0);

            socket.connect();

            socket.on('socket:open', () =>
            {
               assert.strictEqual(socket.bufferedAmount, 0);
               done();
            });
         });

         it('get connected', (done) =>
         {
            socket = new WSClientRPC(options());

            assert.isFalse(socket.connected);

            socket.connect();

            socket.on('socket:open', () =>
            {
               assert.isTrue(socket.connected);
               done();
            });
         });

         it('get extensions', (done) =>
         {
            socket = new WSClientRPC(options());

            assert.strictEqual(socket.extensions, '');

            socket.connect();

            socket.on('socket:open', () =>
            {
               assert.strictEqual(socket.extensions, '');
               done();
            });
         });

         it('get protocol', (done) =>
         {
            socket = new WSClientRPC(options());

            assert.strictEqual(socket.protocol, '');

            socket.connect();

            socket.on('socket:open', () =>
            {
               assert.strictEqual(socket.protocol, '');
               done();
            });
         });

         it('get readyState', (done) =>
         {
            socket = new WSClientRPC(options());

            assert.strictEqual(socket.readyState, 3);

            socket.connect();

            assert.strictEqual(socket.readyState, 0);

            socket.on('socket:open', () =>
            {
               assert.strictEqual(socket.readyState, 1);
               socket.disconnect();
               assert.strictEqual(socket.readyState, 2);
            });

            socket.on('socket:close', () =>
            {
               assert.strictEqual(socket.readyState, 3);
               done();
            });
         });

         it('clientOptions', () =>
         {
            socket = new WSClientRPC({ url: 'ws://localhost:8001' });
            const socket2 = new WSClientRPC({ port: 8001 });

            assert.deepEqual(socket.clientOptions, socket2.clientOptions);
         });

         it('get url', (done) =>
         {
            socket = new WSClientRPC(options());

            assert.strictEqual(socket.url, 'ws://localhost:8001/');

            socket.connect();

            socket.on('socket:open', () =>
            {
               assert.strictEqual(socket.url, 'ws://localhost:8001/');
               done();
            });
         });

         it('get url (ssl)', () =>
         {
            socket = new WSClientRPC(options({ ssl: true }));
            assert.strictEqual(socket.url, 'wss://localhost:8001/');
         });

         it('get url (no clientOptions)', () =>
         {
            socket = new WSClientRPC();
            assert.strictEqual(socket.url, '');
         });

         it('get wsOptions', () =>
         {
            const wsOptions = { test: true };
            socket = new WSClientRPC(options(), wsOptions);

            // wsOptions is only available on Node / browser does not set it.
            assert.deepEqual(socket.wsOptions, env.isNode ? wsOptions : void 0);
         });

         it('reconnect (new path / wsOptions)', async () =>
         {
            const wsOptions = { test: true };
            socket = new WSClientRPC(options());

            await socket.connect();

            assert.strictEqual(socket.url, 'ws://localhost:8001/');

            await socket.reconnect({ clientOptions: options({ path: 'test' }), wsOptions });

            assert.strictEqual(socket.url, 'ws://localhost:8001/test');

            // wsOptions is only available on Node / browser does not set it.
            assert.deepEqual(socket.wsOptions, env.isNode ? wsOptions : void 0);
         });

         if (env.isNode)
         {
            it('connect w/ bad wsOptions', async () =>
            {
               socket = new WSClientRPC();

               await expect(socket.connect({ clientOptions: options(), wsOptions: false })).to.be.rejectedWith(TypeError,
                `'wsOptions' is not an object.`);
            });

            it('bad setOptions (wsOptions)', () =>
            {
               socket = new WSClientRPC();

               expect(() => socket.setOptions({ clientOptions: options(), wsOptions: false })).to.throw(TypeError,
                `'wsOptions' is not an object.`);
            });

            it('wsOptions (empty)', (done) =>
            {
               socket = new WSClientRPC(options({ autoConnect: true }), {});
               socket.on('socket:open', () => done());
            });
         }
      });

      describe(`Custom class:`, () =>
      {
         it('direct callbacks', (done) =>
         {
            class CustomWSClientRPC extends WSClientRPC
            {
               constructor(clientOptions) { super(clientOptions); }

               onSocketClose() { done(); }

               onSocketOpen() { this.send({ msg: 'echo', id: 5 }); }

               onSocketMessage(data)
               {
                  assert.isObject(data);
                  assert.strictEqual(data.msg, 'echo');
                  assert.strictEqual(data.id, 5);

                  this.disconnect();
               }
            }

            const socket = new CustomWSClientRPC(options({ trigger: false }));

            socket.on('socket:close', () => assert.ok(false));
            socket.on('socket:open', () => assert.ok(false));
            socket.on('socket:message:in', () => assert.ok(false));

            socket.connect();
         });
      });
   });
}
