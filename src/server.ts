import * as http from 'http';
import * as path from 'path';
import express from 'express';
import config from 'config';
// import socketio from 'socket.io';
import fetch from 'node-fetch';

const app = express();
const server = new http.Server(app);
// export const io = socketio(server);

export const start = () => {
  const port = config.get('server.port');
  server.listen(port);
  console.info(`server listening on port ${port}`);
};

const staticDirs: {[key: string]: string[]} = config.get('server.static') || {};
Object.keys(staticDirs)
  .forEach((key: string) => {
    staticDirs[key].forEach((dir: string) => {
      app.use(key, express.static(path.resolve(process.cwd(), dir)));
    });
  });


app.get('*', (req: express.Request, res: express.Response) => {
  res.sendFile('static/index.html', {
    root: './',
  });
});
