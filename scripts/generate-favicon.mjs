// public/favicon.svg 에서 public/favicon.ico (16/32/48px 한 파일에 모두 담김)를 만든다.
// 다시 만들려면: npm run generate-favicon
import { readFile } from 'node:fs/promises';
import sharp from 'sharp';
import { sharpsToIco } from 'sharp-ico';

const svg = await readFile(new URL('../public/favicon.svg', import.meta.url));
const sizes = [16, 32, 48];
// 작은 크기도 또렷하게 보이도록 크게 렌더링한 뒤 줄인다.
const images = sizes.map((s) => sharp(svg, { density: 384 }).resize(s, s));
await sharpsToIco(images, new URL('../public/favicon.ico', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'), { sizes });
console.log(`favicon.ico 생성: ${sizes.join(', ')}px`);
