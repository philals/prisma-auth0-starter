import { Prisma } from '../generated/prisma';

export const getUser = async (req, res, next, db: Prisma) => {
  if (!req.token || !req.token.sub) {
    // anonymous user
    return next();
  }
  req.user = await db.query.user({
    // user does not exist
    where: { auth0Id: req.token.sub }
  });
  if (!req.user) {
    console.error(`User ${req.token.sub} does not exist.`);
    req.user = '404';
  }
  next();
};
