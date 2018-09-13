/**
 * @since 20180911 17:16
 * @author vivaxy
 */

const test = require('ava');
const API = require('../index.js');

test('get files', async (t) => {
  const api = new API({ token: '48ba496c2c6ad6a3ae930ba2ab0ac0b97a0d19e8' });
  const ans = await api.getFiles({
    owner: 'Gemini-app',
    repo: 'demo-notebook',
  });
  console.log(ans);
  t.pass();
});
