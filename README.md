# Dioptra Frontend

## See Your First Code Change

1. Clone this repo and navigate inside it: `cd frontend`
1. Pull all submodules recursively:
   ```bash
   git submodule update --init --recursive
   ```
1. Install [docker and docker-compose](https://docs.docker.com/compose/install/) and start docker.
1. Create the application container and start the local the database - these will run in the background and this command will return.
    ```bash
    docker-compose up -d --build
    ```
1. Navigate to `http://localhost:4004` in your browser
1. Make a change in a file under `src/` and save. The server should restart or the client-side bundle be rebuilt as necessary.
1. Reload your browser, your code should now be executed. Congrats!
