import { assertEquals, assertExists, assertRejects } from '@/deps/main.ts';
import { readJson } from '@/utils/file.ts';

const testFilePath = './test_data.json';

Deno.test('readJson works correctly', async () => {
  const testData = { message: 'test successfull' };
  await Deno.writeTextFile(testFilePath, JSON.stringify(testData));

  const result = await readJson<{ message: string }>(testFilePath);

  assertExists(result);
  assertEquals(result.message, 'test successfull');

  await Deno.remove(testFilePath);
});

Deno.test('readJson throws an error if file not exists', async () => {
  await assertRejects(
    async () => {
      await readJson('not_existing_file.json');
    },
    Error,
  );
});

Deno.test('readJson throws an error if file has unvalid JSON', async () => {
  await Deno.writeTextFile(testFilePath, 'this is not valid JSON');

  await assertRejects(
    async () => {
      await readJson(testFilePath);
    },
    Error,
  );

  await Deno.remove(testFilePath);
});

Deno.test('readJson throws an error if file is empty', async () => {
  await Deno.writeTextFile(testFilePath, '');

  await assertRejects(
    async () => {
      await readJson(testFilePath);
    },
    Error,
  );

  await Deno.remove(testFilePath);
});
