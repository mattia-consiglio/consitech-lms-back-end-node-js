import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as net from 'node:net';
import * as dotenv from 'dotenv';
import * as fs from 'node:fs';
import * as path from 'node:path';

// Carica le variabili d'ambiente all'avvio
dotenv.config();

const DEV_PORT_FILE = path.join('.vscode', 'dev-port');

// Funzione per pulire il file temporaneo
const cleanup = () => {
  try {
    if (fs.existsSync(DEV_PORT_FILE)) {
      fs.unlinkSync(DEV_PORT_FILE);
    }
  } catch (error) {
    console.error('Error cleaning up dev-port file:', error);
  }
};

// Registra i gestori per la pulizia
process.on('SIGINT', () => {
  cleanup();
  process.exit(0);
});

process.on('SIGTERM', () => {
  cleanup();
  process.exit(0);
});

const isPortAvailable = (port: number): Promise<boolean> => {
  return new Promise((resolve) => {
    const server = net
      .createServer()
      .listen(port, () => {
        server.once('close', () => resolve(true));
        server.close();
      })
      .on('error', () => resolve(false));
  });
};

async function findAvailablePort(startPort: number): Promise<number> {
  // Prima controlla il file della porta di sviluppo
  try {
    if (fs.existsSync(DEV_PORT_FILE)) {
      const savedPort = Number.parseInt(fs.readFileSync(DEV_PORT_FILE, 'utf8'));
      if (await isPortAvailable(savedPort)) {
        return savedPort;
      }
    }
  } catch {
    // Ignora errori di lettura del file
  }

  // Cerca una nuova porta disponibile
  let port = process.env.PORT ? Number.parseInt(process.env.PORT) : startPort;
  while (!(await isPortAvailable(port))) {
    port++;
  }

  // Salva la porta per le successive esecuzioni in sviluppo
  try {
    if (!fs.existsSync('.vscode')) {
      fs.mkdirSync('.vscode');
    }
    fs.writeFileSync(DEV_PORT_FILE, port.toString());
  } catch {
    // Ignora errori di scrittura del file
  }

  return port;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = await findAvailablePort(3000);
  console.log(`Server starting on port ${port}`);
  await app.listen(port);
}
bootstrap();
