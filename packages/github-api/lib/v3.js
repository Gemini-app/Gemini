/**
 * @since 20180913 18:51
 * @author vivaxy
 */

const axios = require('axios');
const base64 = require('./base64.js');

module.exports = class API {
  constructor({ token }) {
    this.endPoint = 'https://api.github.com';
    this.token = token;
  }

  async request({ method, path }) {
    const resp = await axios({
      headers: {
        Authorization: `token ${this.token}`,
        Accept: 'application/vnd.github.v3+json',
      },
      method,
      url: this.endPoint + path,
    });
    return resp.data;
  }

  async getFiles({ owner, repo, path = '' }) {
    const fileList = await this.getDirFileList({ owner, repo, path });
    const files = await Promise.all(
      fileList.map((file) => {
        const task = async () => {
          if (file.type === 'file') {
            return await this.getFileContent({ owner, repo, path: file.path });
          }
          if (file.type === 'dir') {
            return await this.getFiles({ owner, repo, path: file.path });
          }
          return file;
        };
        return task();
      })
    );
    return files;
  }

  async getFileContent({ owner, repo, path }) {
    const file = await this.request({
      method: 'GET',
      path: `/repos/${owner}/${repo}/contents/${path}`,
    });
    let fileContent = file.content;
    let fileEncoding = file.encoding;
    if (file.encoding === 'base64') {
      fileContent = base64.decode(file.content);
      fileEncoding = 'utf8';
    }
    return {
      name: file.name,
      path: file.path,
      sha: file.sha,
      size: file.size,
      type: file.type,
      content: fileContent,
      encoding: fileEncoding,
    };
  }

  async getDirFileList({ owner, repo, path = '' }) {
    const files = await this.request({
      method: 'GET',
      path: `/repos/${owner}/${repo}/contents/${path}`,
    });
    return files.map((file) => {
      return {
        name: file.name,
        path: file.path,
        sha: file.sha,
        size: file.size,
        type: file.type,
      };
    });
  }

  async updateFile({ owner, repo, path }) {}
};
