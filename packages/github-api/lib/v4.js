/**
 * @since 20180913 18:50
 * @author vivaxy
 */

const axios = require('axios');

module.exports = class API {
  constructor({ token }) {
    this.endPoint = 'https://api.github.com/graphql';
    this.token = token;
  }

  async request({ method, query }) {
    const resp = await axios({
      headers: {
        Authorization: `bearer ${this.token}`,
      },
      method,
      url: this.endPoint,
      data: {
        query,
      },
    });
    return resp.data.data;
  }

  async getFiles({ owner, name }) {
    const ans = await this.request({
      method: 'post',
      query: `query {
  repository(owner: "${owner}", name: "${name}") {
    defaultBranchRef {
      target {
        ... on Commit {
          tree {
            entries {
              name
              object {
                ... on Blob {
                  isBinary
                  byteSize
                  isTruncated
                  text
                }
              }
            }
          }
        }
      }
    }
  }
}`,
    });

    return ans.repository.defaultBranchRef.target.tree.entries.map((file) => {
      return { name: file.name, text: file.object.text };
    });
  }
};
