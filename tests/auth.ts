import { GraphQLClient } from 'graphql-request';
import fetch from 'node-fetch';
import fetchTokens  from './utils/fetchTokens';
import gqlAuthHeader  from './utils/gqlAuthHeader';

const { GRAPHQL_SERVER_URL, AUTH0_TEST_EMAIL } = process.env;

const SIGN_UP_MUTATION = `mutation ($id_token: String!) {
  signUp(idToken: $id_token) {
    id
    email
    emailVerified
  }
}`;

const ME_QUERY = `{
  me {
    id
    name
    email
  }
}`;

const VERIFY_EMAIL_MUTATION = `mutation ($id_token: String!) {
  verifyEmail(idToken: $id_token) {
    id
    email
    emailVerified
  }
}`;

const DELETE_ME_MUTATION = `mutation {
  deleteMe {
    id
  }
}`;

test('should allow the creation of a user account with a valid ID Token', async () => {
  expect.assertions(1);
  const client = new GraphQLClient(GRAPHQL_SERVER_URL);
  const variables = {
    id_token: process.env.AUTH0_TEST_USER_ID_TOKEN,
  };
  const data = await client.request(SIGN_UP_MUTATION, variables);
  expect(data).toHaveProperty('signUp.email', AUTH0_TEST_EMAIL);
});

test('should allow a user with an unverified email to get their profile', async () => {
  expect.assertions(1);
  const client = new GraphQLClient(GRAPHQL_SERVER_URL, gqlAuthHeader());
  const data = await client.request(ME_QUERY);
  expect(data).toHaveProperty('me.email', AUTH0_TEST_EMAIL);
});

test('should not allow a user with an unverified email to delete their account', async () => {
  expect.assertions(1);
  const client = new GraphQLClient(GRAPHQL_SERVER_URL, gqlAuthHeader());
  try {
    await client.request(DELETE_ME_MUTATION);
  } catch(e) {
    expect(e.response.errors[0].message).toEqual("Email not verified")
  }
});

describe('after verifying user email with Auth0 and fetching a new id_token, the server:', () => {
  // Get valid Auth0 id_token
  beforeAll(async () => {
    const { AUTH0_DOMAIN, AUTH0_TEST_USER_ID } = process.env;

    // Create an Auth0 user without sending a verification email to the user
    const res = await fetch(`https://${AUTH0_DOMAIN}/api/v2/users/${AUTH0_TEST_USER_ID}`, {
      method: 'PATCH',
      headers: {
        'content-type': 'application/json',
        'authorization': `bearer ${process.env.AUTH0_API_ACCESS_TOKEN}`
      },
      body: JSON.stringify(
        {
          connection: 'Username-Password-Authentication',
          email_verified: true
        })
    });
    const json = await res.json();
    if (json.email_verified !== true) {
      throw Error(JSON.stringify(json));
    }

    return fetchTokens();
  });

  test('should allow the user to pass the new id_token to verify their email', async () => {
    expect.assertions(1);
    const client = new GraphQLClient(GRAPHQL_SERVER_URL, gqlAuthHeader());
    const variables = {
      id_token: process.env.AUTH0_TEST_USER_ID_TOKEN,
    };
    const data = await client.request(VERIFY_EMAIL_MUTATION, variables);
    expect(data).toHaveProperty('verifyEmail.emailVerified', true);
  });

  test('should allow a user to delete their own account', async () => {
    expect.assertions(1);
    const client = new GraphQLClient(GRAPHQL_SERVER_URL, gqlAuthHeader());
    const data = await client.request(DELETE_ME_MUTATION);
    expect(data).toHaveProperty('deleteMe.id');
  });
});
