const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createProgressStore, emptyProgress, decodeProgress, encodeProgress, progressXp, nextModule, PROGRESS_KEY, PILOT_ID, MAX_BACKUP_BYTES } = require(process.env.BUSHIDO_PROGRESS_TEST_MODULE);

function disk(initial = null) {
  let raw = initial;
  let blocked = false;
  let writes = 0;
  return {
    getItem: key => { assert.equal(key, PROGRESS_KEY); if (blocked) throw Error('denied'); return raw; },
    setItem: (key, value) => { assert.equal(key, PROGRESS_KEY); if (blocked) throw Error('quota'); writes++; raw = value; },
    raw: () => raw,
    writes: () => writes,
    block: value => { blocked = value; },
  };
}
function correctWarmup(store) { store.dispatch({ type: 'warmup-answer', answer: '1' }); store.dispatch({ type: 'check-warmup' }); }
function correctQuiz(store) { ['1', '2', '0'].forEach((answer, index) => store.dispatch({ type: 'quiz-answer', answer, index })); store.dispatch({ type: 'submit-quiz' }); }

test('reload restores progress, unfinished answers and habits without overwriting the saved profile', () => {
  const storage = disk(); const first = createProgressStore(); first.hydrate(storage);
  correctWarmup(first);
  first.dispatch({ type: 'quiz-answer', index: 0, answer: '1' });
  first.dispatch({ type: 'toggle-habit', id: 'respect' });
  const raw = storage.raw(); const writes = storage.writes();
  const reloaded = createProgressStore(); reloaded.hydrate(storage);
  assert.equal(storage.raw(), raw); assert.equal(storage.writes(), writes);
  assert.equal(progressXp(reloaded.getSnapshot().data), 20);
  assert.equal(nextModule(reloaded.getSnapshot().data.courses[PILOT_ID].completed), 'lesson');
  assert.deepEqual(reloaded.getSnapshot().data.courses[PILOT_ID].quizAnswers, ['1', '', '']);
  assert.deepEqual(reloaded.getSnapshot().data.commitments, ['respect']);
});
test('wrong and incomplete answers award no XP; retries and reloads never award a module twice', () => {
  const storage = disk(); let store = createProgressStore(); store.hydrate(storage);
  store.dispatch({ type: 'warmup-answer', answer: '0' }); store.dispatch({ type: 'check-warmup' });
  store.dispatch({ type: 'submit-quiz' }); assert.equal(progressXp(store.getSnapshot().data), 0);
  correctWarmup(store); store.dispatch({ type: 'complete-lesson' });
  ['0', '2', '0'].forEach((answer, index) => store.dispatch({ type: 'quiz-answer', index, answer }));
  store.dispatch({ type: 'submit-quiz' }); assert.equal(progressXp(store.getSnapshot().data), 50);
  store.dispatch({ type: 'retry-quiz' }); correctQuiz(store); assert.equal(progressXp(store.getSnapshot().data), 100);
  store = createProgressStore(); store.hydrate(storage);
  correctWarmup(store); store.dispatch({ type: 'complete-lesson' }); store.dispatch({ type: 'retry-quiz' }); correctQuiz(store);
  assert.equal(progressXp(store.getSnapshot().data), 100);
  assert.equal(store.getSnapshot().data.courses[PILOT_ID].completed.length, 3);
});
test('JSON round trip preserves a partially completed practice and ignores supplied XP fields', () => {
  const storage = disk(); const store = createProgressStore(); store.hydrate(storage); correctWarmup(store);
  const backup = JSON.parse(encodeProgress(store.getSnapshot().data));
  backup.xp = 999999; backup.progress.xp = 999999; backup.progress.courses[PILOT_ID].completed.push('warmup');
  const decoded = decodeProgress(JSON.stringify(backup));
  assert.equal(decoded.ok, true); assert.equal(progressXp(decoded.data), 20);
  assert.deepEqual(decoded.data.courses[PILOT_ID].completed, ['warmup']);
});
test('explicit import and reset persist the whole profile, including drafts and habits', () => {
  const storage = disk(); const store = createProgressStore(); store.hydrate(storage); correctWarmup(store);
  store.dispatch({ type: 'toggle-habit', id: 'honor' });
  const backup = decodeProgress(encodeProgress(store.getSnapshot().data)).data;
  assert.equal(store.reset(), true); assert.equal(progressXp(store.getSnapshot().data), 0);
  assert.deepEqual(store.getSnapshot().data.commitments, []);
  assert.equal(store.replace(backup), true);
  const reloaded = createProgressStore(); reloaded.hydrate(storage);
  assert.equal(progressXp(reloaded.getSnapshot().data), 20); assert.deepEqual(reloaded.getSnapshot().data.commitments, ['honor']);
});
test('known version 1 migrates completions and habits and writes the current format', () => {
  const storage = disk(JSON.stringify({ app: 'bushido-ops', version: 1, completed: ['lesson', 'warmup', 'warmup'], commitments: ['order'] }));
  const store = createProgressStore(); store.hydrate(storage);
  assert.equal(progressXp(store.getSnapshot().data), 50); assert.deepEqual(store.getSnapshot().data.commitments, ['order']);
  assert.equal(JSON.parse(storage.raw()).version, 2); assert.equal(store.getSnapshot().mode, 'saved');
});
test('corrupt and newer stored data is retained during temporary practice until explicit replacement', () => {
  for (const raw of ['{broken', JSON.stringify({ app: 'bushido-ops', version: 99, future: 'retain me' })]) {
    const storage = disk(raw); const store = createProgressStore(); store.hydrate(storage);
    assert.equal(store.getSnapshot().ready, true); assert.equal(store.getSnapshot().mode, 'protected');
    correctWarmup(store); assert.equal(progressXp(store.getSnapshot().data), 20);
    assert.equal(storage.raw(), raw); assert.equal(storage.writes(), 0); assert.equal(store.getSnapshot().savedRaw, raw);
    store.reset(); assert.equal(decodeProgress(storage.raw()).ok, true); assert.equal(store.getSnapshot().mode, 'saved');
  }
});
test('denied reads and failed writes allow practice, export and later saving', () => {
  const storage = disk(); storage.block(true); const store = createProgressStore(); store.hydrate(storage);
  correctWarmup(store); assert.equal(progressXp(store.getSnapshot().data), 20);
  assert.equal(store.getSnapshot().mode, 'temporary'); assert.equal(decodeProgress(encodeProgress(store.getSnapshot().data)).ok, true);
  storage.block(false); store.dispatch({ type: 'complete-lesson' });
  assert.equal(store.getSnapshot().mode, 'saved'); assert.equal(progressXp(decodeProgress(storage.raw()).data), 50);
  storage.block(true); store.dispatch({ type: 'toggle-habit', id: 'order' });
  assert.equal(store.getSnapshot().mode, 'temporary'); assert.deepEqual(store.getSnapshot().data.commitments, ['order']);
});
test('malformed, foreign and unsupported backups are rejected without touching an existing profile', () => {
  const valid = JSON.parse(encodeProgress(emptyProgress()));
  const bad = [null, [], { app: 'other', version: 2 }, { app: 'bushido-ops', version: 0 }, { ...valid, progress: {} }, { ...valid, progress: { ...valid.progress, commitments: ['unknown'] } }];
  for (const input of bad) assert.equal(decodeProgress(JSON.stringify(input)).ok, false);
  valid.progress.courses[PILOT_ID].completed = ['unknown']; assert.equal(decodeProgress(JSON.stringify(valid)).ok, false);
  assert.equal(decodeProgress(' '.repeat(MAX_BACKUP_BYTES + 1)).ok, false);
  assert.deepEqual(decodeProgress(JSON.stringify({ app: 'bushido-ops', version: 99 })), { ok: false, reason: 'newer' });
});
test('external tab changes update all derived progress and explicit removal resets it', () => {
  const storage = disk(); const first = createProgressStore(); const second = createProgressStore(); first.hydrate(storage); second.hydrate(storage);
  correctWarmup(first); second.receiveExternal(storage.raw()); assert.equal(progressXp(second.getSnapshot().data), 20);
  first.reset(); second.receiveExternal(storage.raw()); assert.equal(progressXp(second.getSnapshot().data), 0);
  second.receiveExternal(null); assert.deepEqual(second.getSnapshot().data, emptyProgress());
});
