# Dioptra Frontend

## Getting Started

1. Clone this repo and navigate inside it: `cd frontend`
1. Install [docker and docker-compose](https://docs.docker.com/compose/install/) and start docker.
1. Run the application and start the dev script with this one-line command.

```bash
docker rm -f dioptra-frontend; docker-compose up -d --build && docker exec -ti dioptra-frontend npm run dev
```
