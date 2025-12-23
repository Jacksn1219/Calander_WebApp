# Calander_WebApp
Requirements: https://hrnl.sharepoint.com/:b:/s/CMI-INFWAD-2526/EeSRduqoHWBLs0tOAFa-ztYBaotyj-qSRmgNtAZY1SnqzQ?e=eXgFMi


# For running locally:

## Check Directory 

```bash
cd src
```

## Frontend:

- Correct directory:
```bash
cd client
```

- To install modules etc. :
```bash
npm install
```

- For running:
```bash
yarn start
```
- For building:
```bash
yarn build
```
- For testing:
```bash
yarn test
```

##
If necessary you can substitute the 'yarn' for 'npm'

## Backend:

- Correct directory:
```bash
cd server
```

- For running:
```bash
dotnet run --environment Development
```

- For watch-mode (auto restart on changes):
```bash
dotnet watch run --environment Development
```

# For running on Docker:

### Prerequisites
- Docker Desktop (macOS/Windows) or Docker Engine (Linux)
- Docker Compose v2

### Quick Start (Docker)

1. From the repository root, copy env template:
```bash
cp .env.example .env
```

2. Start both services (frontend + backend):
```bash
docker compose --profile public up --build
```

3. Access the apps:
- Frontend: http://localhost:${FRONTEND_PORT:-3000}
- Backend (Swagger): http://localhost:${BACKEND_PORT:-3001}

### Environment Variables
Configure via `.env` (see `.env.example` for defaults):
- `FRONTEND_PORT` (default 3000)
- `BACKEND_PORT` (default 3001)
- `JWT_SECRET_KEY` (change in production)
- `FRONTEND_URL` and `FRONTEND_URL2` (CORS origins)
- `DB_CONNECTION_STRING` (SQLite location inside backend container)
- `REACT_APP_API_URL` (frontend API base, defaults to backend service)

### Data Persistence
The backend uses SQLite. A named Docker volume `backend-db` persists the database file across restarts. Default location inside the container: `/app/data/app.db`.

### Development (hot reload in containers)
- Frontend runs `npm start` with source mounted. Changes reload automatically.
- Backend runs `dotnet watch run --environment Development` with source mounted.

### Useful Commands
```bash
# Rebuild services
docker compose build

# Build with container logs (MOST RECOMMENDED FOR DEV)
docker compose --profile public up --build

# Restart with clean containers but keep DB volume
docker compose down && docker compose up -d


# Stop and remove everything, including volumes (DB will be wiped!)
docker compose down -v

# View logs
docker compose logs -f backend
docker compose logs -f frontend

# View database through copy
# Copy the database from container to your local machine (including WAL and SHM files)

# For Mac:
docker cp calendar-backend:/app/data/app.db ./app.db && \
docker cp calendar-backend:/app/data/app.db-wal ./app.db-wal && \
docker cp calendar-backend:/app/data/app.db-shm ./app.db-shm


#For Windows:
docker cp calendar-backend:/app/data/app.db ./app.db
docker cp calendar-backend:/app/data/app.db-wal ./app.db-wal
docker cp calendar-backend:/app/data/app.db-shm ./app.db-shm

# Now you can view it with: sqlite3 ./app.db
```

### Troubleshooting
- If frontend cannot reach backend, ensure `REACT_APP_API_URL` points to `http://backend:3001` (container network) or `http://localhost:3001` (host).
- If file changes don’t trigger rebuilds, ensure volumes are mounted (see `docker-compose.yml`) and polling is enabled via env vars.
