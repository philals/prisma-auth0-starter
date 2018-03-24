# Starter Project for a GraphQL Server with Prisma and Auth0

This project was created using the `typescript-graphql-server` boilerplate via `prisma init`. Read more about the idea behind GraphQL boilerplates [here](https://blog.graph.cool/graphql-boilerplates-graphql-create-how-to-setup-a-graphql-project-6428be2f3a5).

This documentation uses [yarn](https://yarnpkg.com) for all dependency management examples, but you can safely substitute all `yarn` commands with `npm` if you wish.

## Features

- **Scalable GraphQL server:** The server uses [`graphql-yoga`](https://github.com/prisma/graphql-yoga) which is based on Apollo Server & Express
- **Static type generation**: TypeScript types for GraphQL queries & mutations are generated in a build step
- **Authentication**: Signup and login workflows are based on Auth0 and are ready to use for your users
- **GraphQL database:** Includes GraphQL database binding to [Prisma](https://www.prismagraphql.com) (running on MySQL)
- **Tooling**: Out-of-the-box support for [GraphQL Playground](https://github.com/prisma/graphql-playground) & [query performance tracing](https://github.com/apollographql/apollo-tracing)
- **Extensible**: Simple and flexible [data model](./database/datamodel.graphql) – easy to adjust and extend
- **No configuration overhead**: Preconfigured [`graphql-config`](https://github.com/prisma/graphql-config) setup

## Getting Started

Ideally you would end up with this repository somewhere locally. The first thing you would probably want to do is make the app your own:
- In `package.json`, change `prisma-auth0-starter` to your service name.
- Copy `.env.example` to `.env` and change the values of `PRISMA_SERVICE`, `PRISMA_STAGE`, and `PRISMA_CLUSTER` to your own, and of course `PRISMA_ENDPOINT` accordingly.
- You can use [Online UUID Generator](https://www.uuidgenerator.net/) to generate secrets for `PRISMA_SECRET` and `APP_SECRET`.

### Setting up Auth0

In the `.env` file you copied above, you should also set `AUTH0_DOMAIN` to [your Auth0 domain](https://auth0.com/docs/getting-started/the-basics#domain). Ideally, this would initially point to your [development environment tenant](https://auth0.com/docs/dev-lifecycle/setting-up-env).

One more thing you must set is `AUTH0_AUDIENCE` which can be found [here](https://manage.auth0.com/#/apis). Note that this should normally be the API you're trying to protect (this GraphQL server!) and not your Auth0 Management API. Read [this](https://auth0.com/docs/quickstart/backend/nodejs/01-authorization) for more information.

### Versioning

You should also consider resetting your service `version` in `package.json` to `1.0.0` and delete `CHANGELOG.md` (I'll show you how to regenerate one for your repository in a couple of sentences).

Assuming you had downloaded this repository instead of forking it, you should now run `yarn install` followed by:
- `git init` to initialize your git repository
- `git add --all` to stage all your files
- Something like `git commit -a -m "feat: initialize repository with conventional commits"` to do your initial commit
- If you want to push this to a new GitHub repository you can run `git remote add origin` followed by your repository URL and finally `git push -u origin master`

To cut your first release, run `yarn release -- --first-release` (this will also regenerate the `CHANGELOG.md` file for you) followed by `git push --follow-tags origin master` and optionally `yarn github-release` (read the first couple of paragraphs of the [Documentation](#Documentation) section below for more info).

## Documentation

This repository follows the [Conventional Commits Specification](https://conventionalcommits.org/). You can use `yarn release` followed by `git push --follow-tags origin master` when you want to cut a release. See the [`standard-version` documentation](https://github.com/conventional-changelog/standard-version) for more information.

If you want to be able to generate GitHub Releases based on commits you need to follow the instructions [here](https://github.com/conventional-changelog/releaser-tools/tree/master/packages/conventional-github-releaser) and use `yarn github-release` every time you want to release a version.

This project also uses [husky](https://github.com/typicode/husky) to [format](https://prettier.io/docs/en/precommit.html#option-2-pretty-quick-https-githubcom-azz-pretty-quick) and [lint](https://github.com/alexjoverm/tslint-config-prettier) your staged files before commits. The previous links point to opinionated methods of doing so.

### Auth0 Integration

In "[Auth0 terms](https://auth0.com/docs/apis)", this repository contains your Resource Server, the API you're trying to protect. Read [this](https://auth0.com/docs/quickstart/backend/nodejs/02-using) to see how you would normally call this API from your client application.

### Commands

* `yarn start` starts GraphQL server on `http://localhost:4000`
* `yarn dev` starts GraphQL server on `http://localhost:4000` _and_ opens GraphQL Playground
* `yarn playground` opens the GraphQL Playground for the `projects` from [`.graphqlconfig.yml`](./.graphqlconfig.yml)
* `yarn prisma <subcommand>` gives access to local version of Prisma CLI (e.g. `yarn prisma deploy`)

> **Note**: It is recommended that you use `yarn dev` during development as it will give you access to the GraphQL API or your server (defined by the [application schema](./src/schema.graphql)) as well as to the Prisma API directly (defined by the [Prisma database schema](./generated/prisma.graphql)). If you're starting the server with `yarn start`, you'll only be able to access the API of the application schema.

### Project structure

![](https://imgur.com/95faUsa.png)

| File name 　　　　　　　　　　　　　　| Description 　　　　　　　　<br><br>|
| :--  | :--         |
| `├── .env` | Defines environment variables |
| `├── .graphqlconfig.yml` | Configuration file based on [`graphql-config`](https://github.com/prisma/graphql-config) (e.g. used by GraphQL Playground).|
| `└── database ` (_directory_) | _Contains all files that are related to the Prisma database service_ |\
| `　　├── prisma.yml` | The root configuration file for your Prisma database service ([docs](https://www.prismagraphql.com/docs/reference/prisma.yml/overview-and-example-foatho8aip)) |
| `　　└── *.graphql` | Defines your data model (written in [GraphQL SDL](https://blog.graph.cool/graphql-sdl-schema-definition-language-6755bcb9ce51)) |
| `└── src ` (_directory_) | _Contains the source files for your GraphQL server_ |
| `　　├── index.ts` | The entry point for your GraphQL server |
| `　　├── schema.graphql` | The **application schema** defining the API exposed to client applications  |
| `　　└── generated` (_directory_) | _Contains generated files_ |
| `　　　　├── prisma.ts` | The generated TypeScript bindings for the Prisma GraphQL API  |
| `　　　　└── prisma.grapghql` | The **Prisma database schema** defining the Prisma GraphQL API  |

## Contributing

The GraphQL boilerplates are maintained by the GraphQL community, with official support from the [Apollo](https://dev-blog.apollodata.com) & [Graphcool](https://blog.graph.cool/) teams.

Your feedback is **very helpful**, please share your opinion and thoughts! If you have any questions or want to contribute yourself, join the [`#graphql-boilerplate`](https://graphcool.slack.com/messages/graphql-boilerplate) channel on our [Slack](https://graphcool.slack.com/).
