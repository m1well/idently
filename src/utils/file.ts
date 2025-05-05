export async function readJson<T>(path: string): Promise<T> {
  const raw = await Deno.readTextFile(path);
  const list = JSON.parse(raw);
  if (!list) {
    console.error(`Error on loading json file ${path}`);
  }
  return list;
}
