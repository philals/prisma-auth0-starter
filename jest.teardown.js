const fetch = require('node-fetch');

module.exports = async () => {
  const result = require('dotenv').config({ path: '.env.test' });
  if (result.error) {
    throw result.error;
  }

  // Delete created Auth0 user
  await fetch(`https://${process.env.AUTH0_DOMAIN}/api/v2/users/${process.env.AUTH0_TEST_USER_ID}`, {
    method: 'DELETE',
    headers: { 'content-type': 'application/json', 'authorization': `bearer ${process.env.AUTH0_API_ACCESS_TOKEN}` }
  });
};
