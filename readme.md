# CSS Optimisation API

This is the API for the CSS Optimisation project.

## Installation

Clone repo and run `npm install`

### Build Typescript

Run `npm run build` to build the typescript files.

### Use example dotenv file

Move the existing `.example.env` file to `.env` and change the values as required.

```
PORT=3000
REMOVAL_INTERVAL=*/5 * * * *  # (use crontab.guru to set a different interval)
API_TOKEN=your_api_token
DEST_DIR=public # (or alternative directory)
```

## Running the API

Run `npm start` to start the API. The API will be available at whatever port is specified in your `.env` file, which by default is `3000`

## Running with Docker

Configuration files are already included for Docker. To run the API in a Docker container, run the following command:

```sh
docker compose up dev --build # for dev environment
```

or

```sh
docker compose up prod --build # for production environment
```
