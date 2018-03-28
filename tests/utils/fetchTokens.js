const fetchTokens = async () => {
  const {
    AUTH0_DOMAIN,
    AUTH0_TEST_EMAIL,
    AUTH0_TEST_PASSWORD,
    AUTH0_AUDIENCE,
    AUTH0_PASSWORD_GRANT_CLIENT_ID,
    AUTH0_PASSWORD_GRANT_CLIENT_SECRET
  } = process.env;

  const fetch = require('node-fetch');

  const res = await fetch(`https://${AUTH0_DOMAIN}/oauth/token`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(
      {
        grant_type: 'password',
        username: AUTH0_TEST_EMAIL,
        password: AUTH0_TEST_PASSWORD,
        audience: AUTH0_AUDIENCE,
        scope: 'openid',
        client_id: AUTH0_PASSWORD_GRANT_CLIENT_ID,
        client_secret: AUTH0_PASSWORD_GRANT_CLIENT_SECRET
      })
  });
  const json = await res.json();
  if (!json.id_token || !json.access_token) {
    throw Error(JSON.stringify(json));
  }
  process.env.AUTH0_TEST_USER_ID_TOKEN = json.id_token;
  process.env.AUTH0_TEST_USER_ACCESS_TOKEN = json.access_token;
};

// Needed for TypeScript.
fetchTokens.default = fetchTokens;

module.exports = exports = fetchTokens;
