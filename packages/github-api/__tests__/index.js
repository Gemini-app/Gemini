/**
 * @since 20180911 17:16
 * @author vivaxy
 */

const test = require('ava');
const API = require('../index.js');

const owner = 'Gemini-app';
const repo = 'demo-notebook';
const token = '';

test('get files', async(t) => {
  const api = new API({ token });
  const ans = await api.getFiles({ owner, repo });
  t.is(ans.length, 3);
});

test('update file', async(t) => {
  const api = new API({ token });
  const ans = await api.getFiles({ owner, repo });
  const updateFile = ans[1];
  const resp = await api.updateFile({
    owner,
    repo,
    path: updateFile.path,
    sha: updateFile.sha,
    content: new Date().toString(),
    message: 'Commit with GeminiApp',
  });
  t.is(typeof resp.content, 'object');
  t.is(typeof resp.commit, 'object');
});
