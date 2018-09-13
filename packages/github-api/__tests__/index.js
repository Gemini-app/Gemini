/**
 * @since 20180911 17:16
 * @author vivaxy
 */

const test = require('ava');
const API = require('../index.js');

test('get files', async(t) => {
  const owner = 'Gemini-app';
  const repo = 'demo-notebook';
  const token = '';
  const api = new API({ token });
  const ans = await api.getFiles({ owner, repo });
  t.is(ans.length, 3);
  const updateFile = ans[1];
  const resp = await api.updateFile({ owner, repo, path: updateFile.path, sha: updateFile.sha, content: new Date().toString(), message: 'Commit with GeminiApp' });
  console.log(resp);
  t.pass();
});
