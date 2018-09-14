/**
 * @since 20180911 17:16
 * @author vivaxy
 */

const test = require('ava');
const API = require('../index.js');

const owner = 'Gemini-app';
const repo = 'demo-notebook';
const token = require('./helpers/token.js');

test.serial('read file', async(t) => {
  const api = new API({ token, owner, repo });
  const file = await api.readFile({ path: '__tests__/fixtures/get-file.txt' });
  t.is(file.content, 'get file ok');
});

test.serial('create file', async(t) => {
  const path = '__tests__/fixtures/create-file.txt';
  const content = 'create file ok';
  const api = new API({ token, owner, repo });
  await api.createFile({ path, content });
  const file = await api.readFile({ path });
  t.is(file.content, content);
  await api.deleteFile({ path, sha: file.sha });
});

test.serial('delete file', async(t) => {
  const dir = '__tests__/fixtures';
  const path = dir + '/delete-file.txt';
  const content = 'delete file';
  const api = new API({ token, owner, repo });
  const resp = await api.createFile({ path, content });
  await api.deleteFile({ path, sha: resp.content.sha });
  let fileList = await api.readDir({ path: dir });
  fileList = fileList.filter((file) => {
    return file.path === path;
  });
  t.is(fileList.length, 0);
});

test.serial('update file', async(t) => {
  const path = '__tests__/fixtures/update-file.txt';
  const content = new Date().toString();
  const api = new API({ token, owner, repo });
  let file = await api.readFile({ path });
  t.is(content === file.content, false);
  await api.updateFile({ path, sha: file.sha, content });
  file = await api.readFile({ path });
  t.is(content, file.content);
});

test.serial('move file', async(t) => {
  const fromPath = '__tests__/fixtures/move-file.txt';
  const toPath = '__tests__/fixtures/move-file-destination.txt';
  const api = new API({ token, owner, repo });
  const file = await api.readFile({ path: fromPath });
  await api.moveFile({ fromPath, toPath });
  const newFile = await api.readFile({ path: toPath });
  t.is(file.content, newFile.content);
  await api.moveFile({ fromPath: toPath, toPath: fromPath });
});

test.serial('create dir', async(t) => {
  const path = '__tests__/fixtures/create-dir';
  const gitKeepPath = path + '/.gitkeep';
  const api = new API({ token, owner, repo });
  const resp = await api.createDir({ path });
  const file = await api.readFile({ path: gitKeepPath });
  t.is(file.content, '');
  await api.deleteFile({ path: gitKeepPath, sha: resp.content.sha });
});

test.serial('read dir', async(t) => {
  const path = '__tests__/fixtures';
  const api = new API({ token, owner, repo });
  const files = await api.readDir({ path });
  t.is(files.length, 4);
});

test.serial('read dir recursively', async(t) => {
  const path = '__tests__/fixtures';
  const name = 'recursive-dir';
  const api = new API({ token, owner, repo });
  const files = await api.readDirR({ path });
  t.is(files.length, 4);
  const rDir = files.find((file) => {
    return file.name === name;
  });
  t.is(rDir.files.length, 1);
});
