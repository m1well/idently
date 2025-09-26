export async function readJsonFiles<T>(folderPath: string): Promise<T[]> {
  const results: T[] = [];

  try {
    for await (const entry of Deno.readDir(folderPath)) {
      if (entry.name.endsWith('.json')) {
        const filePath = `${folderPath}/${entry.name}`;
        try {
          const raw = await Deno.readTextFile(filePath);
          const parsed = JSON.parse(raw);
          results.push(parsed);
        } catch (error) {
          console.error(`Error reading JSON file ${filePath}:`, error);
        }
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${folderPath}:`, error);
  }

  return results;
}
