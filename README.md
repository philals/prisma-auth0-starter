# Starter Project for a GraphQL Server with Prisma and Auth0

This project was created using the `typescript-graphql-server` boilerplate via `prisma init`. Read more about the idea behind GraphQL boilerplates [here](https://blog.graph.cool/graphql-boilerplates-graphql-create-how-to-setup-a-graphql-project-6428be2f3a5).

This documentation uses [yarn](https://yarnpkg.com) for all dependency management examples, but you can safely substitute all `yarn` commands with `npm` if you wish.

## Features

- **Scalable GraphQL server:** The server uses [`graphql-yoga`](https://github.com/prisma/graphql-yoga) which is based on Apollo Server & Express
- **Static type generation**: TypeScript types for GraphQL queries & mutations are generated in a build step
- **Authentication**: Sign up and login are based on Auth0; see [Auth0 Integration](#auth0-integration) below
- **GraphQL database:** Includes GraphQL database binding to [Prisma](https://www.prismagraphql.com) (running on MySQL)
- **Tooling**: Out-of-the-box support for [GraphQL Playground](https://github.com/prisma/graphql-playground) & [query performance tracing](https://github.com/apollographql/apollo-tracing)
- **Extensible**: Simple and flexible [data model](./database/types.graphql) – easy to adjust and extend
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

To cut your first release, run `yarn release -- --first-release` (this will also regenerate the `CHANGELOG.md` file for you) followed by `git push --follow-tags origin master` and optionally `yarn github-release` (read the first couple of paragraphs of the [Documentation](#documentation) section below for more info).

## Documentation

This repository follows the [Conventional Commits Specification](https://conventionalcommits.org/). You can use `yarn release` followed by `git push --follow-tags origin master` when you want to cut a release. See the [`standard-version` documentation](https://github.com/conventional-changelog/standard-version) for more information.

If you want to be able to generate GitHub Releases based on commits you need to follow the instructions [here](https://github.com/conventional-changelog/releaser-tools/tree/master/packages/conventional-github-releaser) and use `yarn github-release` every time you want to release a version.

This project also uses [husky](https://github.com/typicode/husky) to [format](https://prettier.io/docs/en/precommit.html#option-2-pretty-quick-https-githubcom-azz-pretty-quick) and [lint](https://github.com/alexjoverm/tslint-config-prettier) your staged files before commits. The previous links point to opinionated methods of doing so.

### Auth0 Integration

In "[Auth0 terms](https://auth0.com/docs/apis)", this repository contains your Resource Server, the API you're trying to protect. Read [this](https://auth0.com/docs/quickstart/backend/nodejs/02-using) to see how you would normally call this API from your client application.

**Sign Up**

Typically, your client application (say for example an Angular or a React SPA) would check if a valid access token is  [stored locally](https://auth0.com/docs/security/store-tokens) and, if not, call Auth0's `/authorize` endpoint (most probably through [`Auth0.js`](https://auth0.com/docs/libraries/auth0js/v9)) to sign your user up. Note that this would be valid for both username/password and social (Facebook, Google, etc.) authentication. After Auth0 returns control to your client application through a callback you would have previously set (see `redirectUri` [here](https://auth0.com/docs/libraries/auth0js/v9#available-parameters)), you should call the `signUp` mutation, passing the ID Token that Auth0 had returned.

> **Note**: You should use `id_token` and not `access_token`; both are returned by Auth0.

The `signUp` mutation resolver will parse the provided ID Token using [`jsonwebtoken`](https://github.com/auth0/node-jsonwebtoken) and verify its signature using your [Auth0 account's JWKS endpoint](https://auth0.com/docs/jwks). If all is well, a `User` object will be created and returned.

**Login**
 
If a valid access token was indeed found and passed expiry check, you may call the `me` query directly. Using the [`access_token`](https://auth0.com/docs/tokens/access-token) (not the ID Token!) previously stored, calling the `me` query should return the same `User` object created above.

> **Note**: The access token passed is always verified using the [`checkJwt`](./src/middleware/checkJwt.ts) function, and attached to the current express `Request` using the [`getUser`](./src/middleware/getUser.ts) function.

**Email Verification**

If your user signs up using an [Auth0 Database Connection](https://auth0.com/docs/connections/database), you're probably going to want to verify their email before giving them full access to your API. Auth0 triggers a [verification email](https://auth0.com/docs/email/custom#verification-email) for such sign up actions and allows you to set a URL to [**Redirect To**](https://manage.auth0.com/#/emails) after the user clicks the provided email verification link. Ideally you would redirect to your client application and call [`checkSession`](https://auth0.com/docs/libraries/auth0js/v8#using-checksession-to-acquire-new-tokens) to acquire a new ID Token, which you would then use to call the `verifyEmail` mutation of this server.

> **Note**: Make sure the **Redirect To** URL that you set above exists in the **Allowed Web Origins** of your [Auth0 Client](https://manage.auth0.com/#/clients), otherwise `checkSession` may throw an error.

By default, if you use any [directive resolver](./src/directive-resolvers.ts) in your [schema](./src/schema.graphql) queries or mutations, the requesting user object's `emailVerified` field will be checked and the request will return with an `Email not verified.` error if the user has not verified their email. You can override this (only with the `@isAuthenticated` directive) as follows:

```graphql schema
type Query {
  me: User @isAuthenticated(checkIfEmailIsVerified: false)
}
```

In the above query, it makes sense that the user can still retrieve their info even if they have not yet verified their email.

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
