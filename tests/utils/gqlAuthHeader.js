const gqlAuthHeader = () => {
  return {
    headers: {
      Authorization: `Bearer ${process.env.AUTH0_TEST_USER_ACCESS_TOKEN}`
    }
  };
};

// Needed for TypeScript.
gqlAuthHeader.default = gqlAuthHeader;

module.exports = exports = gqlAuthHeader;
