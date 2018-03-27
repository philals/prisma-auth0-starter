import { Context } from './context';

const isLoggedIn = (ctx: Context, checkIfEmailIsVerified = true) => {
  const user = ctx.request.user;
  if (!user) {
    throw new Error(`Authentication error.`);
  }
  if (checkIfEmailIsVerified && !user.emailVerified) {
    throw new Error(`Email not verified.`);
  }
  return user;
};

const isRequestingUserAlsoOwner = async ({ ctx, userId, type, typeId, ownerField = 'user' }) =>
  ctx.db.exists[type]({ id: typeId, [ownerField]: { id: userId } });

export const directiveResolvers = {

  isAuthenticated: (next, source, { checkIfEmailIsVerified }, ctx: Context) => {
    isLoggedIn(ctx, checkIfEmailIsVerified);
    return next();
  },

  hasRole: (next, source, { roles }, ctx: Context) => {
    const { role } = isLoggedIn(ctx);

    if (roles.includes(role)) {
      return next();
    }

    console.error(`Role ${role} is not authorized.`);
    throw new Error('Authorization error.');
  },

  isOwner: async (next, source, { type }, ctx: Context) => {
    const { id: userId } = isLoggedIn(ctx);

    const { id: typeId } =
      source && source.id ? source : ctx.request.body.variables ? ctx.request.body.variables : { id: null };
    const isOwner =
      type === `User` ? userId === typeId : await isRequestingUserAlsoOwner({ ctx, userId, type, typeId });

    if (isOwner) {
      return next();
    }

    console.error(`User ${userId} is not owner of type ${typeId}.`);
    throw new Error('Authorization error.');
  },

  isOwnerOrHasRole: async (next, source, { roles, type }, ctx: Context) => {
    const { id: userId, role } = isLoggedIn(ctx);
    if (roles.includes(role)) {
      return next();
    }

    const { id: typeId } =
      source && source.id ? source : ctx.request.body.variables ? ctx.request.body.variables : { id: null };
    const isOwner =
      type === `User` ? userId === typeId : await isRequestingUserAlsoOwner({ ctx, userId, type, typeId });

    if (isOwner) {
      return next();
    }
    console.error(`User ${userId} is not owner of type ${typeId} and role ${role} is not authorized.`);
    throw new Error('Authorization error.');
  }
};
