import WebSocket  from 'ws';

export default class WSTestServer
{
   constructor({ silent = false } = {})
   {
      this._options = {
         silent
      };
   }

   _init()
   {
      this._wss.on('connection', (ws) =>
      {
         ws.on('message', (message) =>
         {
            const data = typeof message === 'string' ? JSON.parse(message) : message;

            if (data.constructor === Object)
            {
               switch (data.msg)
               {
                  case 'close':
                     ws.close();
                     break;
                  case 'echo':
                     ws.send(JSON.stringify({ msg: 'echo', id: data.id }));
                     break;
                  case 'not-json':
                     ws.send('Not JSON');
                     break;
               }
            }
            else
            {
               ws.send(data);
            }
         });
      });
   }

   _log(message)
   {
      if (!this._options.silent) { console.log(message); }
   }

   async shutdown()
   {
      return new Promise((resolve, reject) =>
      {
         if (this._wss)
         {
            this._wss.once('error', () => reject());

            this._wss.close(() =>
            {
               this._wss.removeAllListeners();
               resolve();
            });
         }
         else
         {
            resolve();
         }
      });
   }

   async start({ host = 'localhost', port = 8001 } = {})
   {
      return new Promise((resolve, reject) =>
      {
         this._wss = new WebSocket.Server({ host, port, handleProtocols: () => 'foo' });

         this._wss.once('error', () => reject());

         this._wss.on('listening', () =>
         {
            this._init();

            this._wss.removeAllListeners('error');

            const address = this._wss.address();
            this._log(`${s_GET_TIME()} WSTestServer is listening on (${address.address}:${address.port})`);
            resolve();
         });
      });
   }
}

const s_GET_TIME = () =>
{
   const date = new Date();

   let hour = date.getHours();
   if (hour < 10) { hour = `0${hour}`; }

   let minutes = date.getMinutes();
   if (minutes < 10) { minutes = `0${minutes}`; }

   let sec = date.getSeconds();
   if (sec < 10) { sec = `0${sec}`; }

   return `[${hour}:${minutes}:${sec}.${date.getMilliseconds()}]`;
};
