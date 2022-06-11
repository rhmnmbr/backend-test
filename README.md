### Installing

1. Clone the repository
2. Once Docker is installed, start the Docker Desktop
3. At the auth and fetch directory which include **docker-compose.yml** files, run below command:
```
docker-compose -f docker-compose.yml -f docker-compose.override.yml up -d
```

1. Wait for docker compose all services.
2. Launch http://host.docker.internal:8000/docs in your browser to view the documentation of the Auth API.
3. Launch http://host.docker.internal:3000/api-docs in your browser to view the documentation of the Fetch API.