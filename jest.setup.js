const fetchTokens = require('./tests/utils/fetchTokens');

module.exports = async () => {
  const result = require('dotenv').config({ path: '.env.test' });
  if (result.error) {
    throw result.error;
  }

  const {
    AUTH0_DOMAIN,
    AUTH0_TEST_EMAIL,
    AUTH0_TEST_PASSWORD,
    AUTH0_CREDENTIALS_GRANT_CLIENT_ID,
    AUTH0_CREDENTIALS_GRANT_CLIENT_SECRET
  } = process.env;

  const fetch = require('node-fetch');

  // Use an Auth0 test client configured with client_credentials grant to retrieve an API token
  // This token can be used to call Auth0 Management API methods https://auth0.com/docs/api/management/v2
  let res = await fetch(`https://${AUTH0_DOMAIN}/oauth/token`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(
      {
        grant_type: 'client_credentials',
        audience: `https://${AUTH0_DOMAIN}/api/v2/`,
        client_id: AUTH0_CREDENTIALS_GRANT_CLIENT_ID,
        client_secret: AUTH0_CREDENTIALS_GRANT_CLIENT_SECRET
      })
  });
  let json = await res.json();
  if (!json.access_token) {
    throw Error(JSON.stringify(json));
  }
  process.env.AUTH0_API_ACCESS_TOKEN = json.access_token;

  // Create an Auth0 user without sending a verification email to the user
  res = await fetch(`https://${AUTH0_DOMAIN}/api/v2/users`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'authorization': `bearer ${process.env.AUTH0_API_ACCESS_TOKEN}` },
    body: JSON.stringify(
      {
        connection: 'Username-Password-Authentication',
        email: AUTH0_TEST_EMAIL,
        password: AUTH0_TEST_PASSWORD,
        verify_email: false
      })
  });
  json = await res.json();
  if (!json.user_id) {
    throw Error(JSON.stringify(json));
  }
  process.env.AUTH0_TEST_USER_ID = json.user_id;

  // Get an ID token and an access token for the above created user
  await fetchTokens();
};
