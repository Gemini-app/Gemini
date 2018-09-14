/**
 * @since 20180913 18:51
 * @author vivaxy
 */

const axios = require('axios');
const base64 = require('./base64.js');

module.exports = class API {
  constructor({ token, owner, repo }) {
    this.endPoint = 'https://api.github.com';
    this.token = token;
    this.owner = owner;
    this.repo = repo;
    this.defaultMessage = 'Commit with GeminiApp';
    this.defaultBranch = 'master';
    this.defaultPath = '';
  }

  async request({ method, path, data = {} }) {
    const resp = await axios({
      headers: {
        Authorization: `token ${this.token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      method,
      url: this.endPoint + path,
      data,
    });
    return resp.data;
  }

  async readDirRecursively({ path = this.defaultPath }) {
    const fileList = await this.readDir({ path });
    return await Promise.all(
      fileList.map((file) => {
        const task = async() => {
          if (file.type === 'file') {
            return await this.readFile({ path: file.path });
          }
          if (file.type === 'dir') {
            return await this.readDirRecursively({ path: file.path });
          }
          return file;
        };
        return task();
      }),
    );
  }

  async readFile({ path }) {
    const file = await this.request({
      method: 'GET',
      path: `/repos/${this.owner}/${this.repo}/contents/${path}`,
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

  async readDir({ path = this.defaultPath }) {
    const files = await this.request({
      method: 'GET',
      path: `/repos/${this.owner}/${this.repo}/contents/${path}`,
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

  async updateFile({ path, sha, content, message = this.defaultMessage, branch = this.defaultBranch }) {
    if (!sha) {
      const file = await this.readFile({ path });
      sha = file.sha;
    }
    return await this.request({
      method: 'PUT',
      path: `/repos/${this.owner}/${this.repo}/contents/${path}`,
      data: {
        path,
        message,
        content: base64.encode(content),
        sha,
        branch,
      },
    });
  }

  async createFile({ path, content, message = this.defaultMessage, branch = this.defaultBranch }) {
    return await this.request({
      method: 'PUT', path: `/repos/${this.owner}/${this.repo}/contents/${path}`, data: {
        path,
        message,
        content: base64.encode(content),
        branch,
      },
    });
  }

  async deleteFile({ path, sha, message = this.defaultMessage, branch = this.defaultBranch }) {
    if (!sha) {
      const file = await this.readFile({ path });
      sha = file.sha;
    }
    return await this.request({
      method: 'DELETE', path: `/repos/${this.owner}/${this.repo}/contents/${path}`, data: {
        path,
        message,
        sha,
        branch,
      },
    });
  }

  /**
   * Move file
   * @param fromPath
   * @param toPath
   * @returns {Promise<*>}
   */
  async moveFile({ fromPath, toPath }) {
    const file = await this.readFile({ path: fromPath });
    const newFileResp = await this.createFile({ path: toPath, content: file.content });
    await this.deleteFile({ path: fromPath, sha: file.sha });
    return newFileResp;
  }

  async createDir({}) {

  }

};
