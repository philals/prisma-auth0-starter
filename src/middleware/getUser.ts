export const getUser = async (req, res, next, db) => {
  if (!req.token || !req.token.sub) {
    return next();
  }
  req.user = await db.query.user({
    where: { auth0Id: req.token.sub }
  });
  next();
};
