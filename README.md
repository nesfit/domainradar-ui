# domainradar-ui
Web user interface for DomainRadar built with Nuxt 3.

## Setup
You need a modern version of Node.js and preferably Yarn installed on your
machine. You can install Yarn with npm by running `npm install -g yarn`.
Don't ask me why, but other package managers like npm or pnpm don't work
well with this project. I really tried, I don't like Yarn either.

Install dependencies with Yarn:
```bash
yarn install
```

Then run the Prisma codegen to generate the Prisma client:
```bash
npx prisma generate --sql
```

### Environment setup
See the .env.example file for the environment variables that need to be set
and their descriptions.

### Kafka SSL files
See [server/assets/README.md](server/assets/README.md) for details on
how to set up the Kafka SSL files. This is necessary for the UI to
be able to read and send configuration of other DomainRadar components.

### Running
To start the development server, run:
```bash
yarn dev
```

To build the project, run:
```bash
yarn build
```
---

To build a Docker image, run:
```bash
docker compose build
```
or
```bash
docker build -t domainradar-ui .
```
The image contains the complete full-stack application, including the
Nuxt 3 frontend and the Nitro server. It is designed to run as
a single container acting as the UI component of DomainRadar.

The compose file is used to run alongside a mongodb container for
development purposes. In production, the UI image should be deployed
alongside the other DomainRadar components in a sensible manner
and connected to its dependencies as defined in environment.