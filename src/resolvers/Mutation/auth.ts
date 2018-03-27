import { Context } from '../../context';
import * as jwksClient from 'jwks-rsa';
import * as jwt from 'jsonwebtoken';

const jwks = jwksClient({
  cache: true,
  rateLimit: true,
  jwksRequestsPerMinute: 1,
  jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`
});

const parseIdToken = idToken =>
  new Promise((resolve, reject) => {
    const { header, payload } = jwt.decode(idToken, { complete: true });
    if (!header || !header.kid || !payload) {
      reject(new Error('Invalid token.'));
    }
    jwks.getSigningKey(header.kid, (fetchError, key) => {
      if (fetchError) {
        reject(new Error('Error getting signing key: ' + fetchError.message));
      }
      return jwt.verify(
        idToken,
        key.publicKey,
        { algorithms: ['RS256'] },
        (verificationError, decoded) => {
          if (verificationError) {
            reject('Verification error: ' + verificationError.message);
          }
          resolve(decoded);
        }
      );
    });
  });

export const auth = {

  async signUp(parent, { idToken }, ctx: Context, info) {
    let token = null;
    try {
      token = await parseIdToken(idToken);
    } catch (err) {
      console.error(err);
      throw new Error(err.message);
    }
    const auth0Id = token.sub;
    const user = await ctx.db.query.user({ where: { auth0Id } }, info);
    if (user) {
      return user;
    }
    return ctx.db.mutation.createUser({
      data: {
        email: token.email,
        emailVerified: token.email_verified,
        auth0Id: token.sub,
        name: token.name,
        avatar: token.picture
      }
    });
  },

  async verifyEmail(parent, { idToken }, ctx: Context, info) {
    let token = null;
    try {
      token = await parseIdToken(idToken);
    } catch (err) {
      console.error(err);
      throw new Error(err.message);
    }
    if (ctx.request.user.auth0Id !== token.sub) {
      console.error(`Request user identity (${ctx.request.user.auth0Id}) does not match ID Token sub (${token.sub})`);
      throw new Error('Error matching user identity.');
    }
    return ctx.db.mutation.updateUser({
      data: { emailVerified: token.email_verified },
      where: { auth0Id: token.sub } }, info);
  },

  async deleteMe(parent, args, ctx: Context, info) {
    return ctx.db.mutation.deleteUser({ where: { id: ctx.request.user.id } }, info);
  }
};
