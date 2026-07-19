import fs from 'fs';
import path from 'path';

function walkDir(dir: string, callback: (path: string) => void) {
  fs.readdirSync(dir).forEach((f) => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

const apiDir = path.join(process.cwd(), 'src/app/api');
walkDir(apiDir, (filePath) => {
  if (!filePath.endsWith('route.ts')) return;
  if (filePath.includes('auth')) return; // Better Auth route

  let content = fs.readFileSync(filePath, 'utf-8');

  // Replace import { handleRouteError } ... with import { withRouteHandler } ...
  content = content.replace(
    /import \{ handleRouteError \} from '@\/shared\/utils\/handleRoute';/g,
    "import { withRouteHandler } from '@/shared/utils/handleRoute';"
  );

  if (!content.includes('withRouteHandler')) {
    content =
      "import { withRouteHandler } from '@/shared/utils/handleRoute';\n" +
      content;
  }

  // Find all export async function METHOD(args...) { try { ... } catch (error) { return handleRouteError(error); } }
  // We need to match the signature properly.

  const functionRegex =
    /export async function (GET|POST|PUT|PATCH|DELETE)\s*\(([^)]*)\)\s*\{([\s\S]*?)try\s*\{([\s\S]*?)\}\s*catch\s*\([^)]*\)\s*\{([\s\S]*?handleRouteError[\s\S]*?)\}\s*\}/g;

  content = content.replace(
    functionRegex,
    (match, method, args, preTry, tryBlock, catchBlock) => {
      // If there's code before try block, we can't just strip try/catch easily without moving that code.
      // However, in our routes, the try block usually starts immediately.
      const strippedArgs = args.trim();
      if (preTry.trim() !== '') {
        // Keep try catch inside wrapper if preTry exists?
        // Actually, if we wrap it, the wrapper handles errors anyway, so we can just put everything inside the wrapper function.
        return `export const ${method} = withRouteHandler(async (${strippedArgs}) => {${preTry}${tryBlock}});`;
      } else {
        return `export const ${method} = withRouteHandler(async (${strippedArgs}) => {${tryBlock}});`;
      }
    }
  );

  // There are some Zod catch blocks, let's also remove them because handleRouteError now catches ZodErrors
  const zodRegex =
    /if \([^)]*ZodError[^)]*\)\s*\{[\s\S]*?return NextResponse\.json\([\s\S]*?\);\s*\}/g;
  content = content.replace(zodRegex, '');

  fs.writeFileSync(filePath, content, 'utf-8');
});
console.log('Done refactoring');
