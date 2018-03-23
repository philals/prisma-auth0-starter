import { GraphQLServer } from 'graphql-yoga';
import { Prisma } from './generated/prisma';
import { checkJwt, getUser } from './middleware';
import resolvers from './resolvers';
import { directiveResolvers } from './directive-resolvers';

const db = new Prisma({
  endpoint: process.env.PRISMA_ENDPOINT, // the endpoint of the Prisma DB service (value is set in .env)
  secret: process.env.PRISMA_SECRET, // taken from database/prisma.yml (value is set in .env)
  debug: process.env.PRISMA_STAGE !== 'production' // log all GraphQL queries & mutations
});

const server = new GraphQLServer({
  typeDefs: './src/schema.graphql',
  resolvers,
  directiveResolvers,
  context: req => ({
    ...req,
    db
  })
});

server.express.post(
  server.options.endpoint,
  checkJwt,
  (err, req, res, next) => {
    if (err) {
      console.error('Token error: ' + err);
      return res.status(401).send(err.message);
    }
    next();
  }
);

server.express.post(server.options.endpoint, (req, res, next) =>
  getUser(req, res, next, db)
);

server.start(() => console.log('Server is running on http://localhost:4000'))
  .catch((err) => console.error('Error starting server: ' + err));
