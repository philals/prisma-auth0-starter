import { auth } from './Mutation';
import { me } from './Query';

export default {
  Query: {
    me
  },
  Mutation: {
    ...auth
  }
};
