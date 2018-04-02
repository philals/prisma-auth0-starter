import { Context } from '../../context';

export const me = (parent, args, ctx: Context) => {
  return ctx.request.user;
};
