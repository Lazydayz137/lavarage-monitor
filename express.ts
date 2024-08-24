import express, { Request, Response } from 'express';
import { Monitoring } from './types/monitoring';
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.get('/status', (request: Request, response: Response) => response.json({clients: clients.length}));

const PORT = 3000;

let clients: any[] = [];


function eventsHandler(request: Request, response: Response, next: any) {
  const headers = {
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache'
  };
  response.writeHead(200, headers);

  const data = `data: ${JSON.stringify({})}\n\n`;

  response.write(data);

  const clientId = Date.now();

  const newClient = {
    id: clientId,
    response
  };

  clients.push(newClient);

  request.on('close', () => {
    console.log(`${clientId} Connection closed`);
    clients = clients.filter(client => client.id !== clientId);
  });
}

app.get('/events', eventsHandler);

export function sendEventsToAll(newMonitoring: Monitoring) {
  clients.forEach(client => client.response.write(`data: ${JSON.stringify(newMonitoring)}\n\n`))
}

export const listen = () => app.listen(PORT, () => {
  console.log(`Facts Events service listening at http://localhost:${PORT}`)
})