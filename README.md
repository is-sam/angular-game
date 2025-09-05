# Angular Game

A small Bomberman-style game for the browser built with Angular and TypeScript. Move around the grid, drop bombs to remove obstacles and defeat roaming enemies, and collect bonuses for stronger explosions.

## Technology

- [Angular](https://angular.io/) 12 with TypeScript
- Assets for sprites and sound stored under `src/assets`
- Docker configuration for containerised development

## Getting Started

### Prerequisites
- Node.js 16+ and npm
- Alternatively Docker and Docker Compose

### Install & Run with Node
```bash
npm install
npm start
```
Visit <http://localhost:4200> to play.

### Run with Docker
```bash
docker-compose up
```
This starts an Angular dev server on port 4200 inside a container.

### Build for Production
```bash
npm run build
```
The compiled output is placed in the `dist/` directory.

### Tests
```bash
npm test
```
Executes Karma/Jasmine unit tests (requires a local Chrome browser).
