import { Context } from '../../context';

export const me = (parent, args, ctx: Context, info) => {
  return ctx.db.query.user({ where: { id: ctx.request.user.id } }, info);
};
