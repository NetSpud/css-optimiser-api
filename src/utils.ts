import path from "path";
import { parse } from "node-html-parser";
const fetchText = async (url: string): Promise<string> => {
  const f = await fetch(url);
  if (!f.ok) {
    console.error(`Failed to fetch ${url}\nSKIPPING`);
    throw new Error(`Failed to fetch ${url}`);
  }
  const j = await f.text();
  return j;
};

const retrieveCSSFiles = async (urls: string[]): Promise<string[]> => {
  if (!urls) return [];
  //ignore any external css files

  const cssFiles = await Promise.all(
    urls.map(async (url) => {
      return { data: await fetchText(url), folder: path.dirname(url), url };
    })
  );

  //write each css file to disk for analysis

  // cssFiles.forEach(async (file) => {
  //   const filename = path.basename(file.url);
  //   const filepath = path.resolve(`public/analysis/${Math.floor(Math.random() * 10) + filename.replace(/\?.*/gm, "")}`);
  //   await writeFile(filepath, file.data);
  // });

  const replaced = cssFiles
    .map((x: Record<string, string>) => {
      x.data = x.data.replace(/\/\*[\s\S]*?\*\//g, "");
      x.data = x.data.replace(/^\s*\/\/.*;$/gm, "");
      x.data = x.data.replace(/url\((\.\.\/)/g, `url(${x.folder}/../`);

      return x;
    })
    .map((x) => x.data);

  return replaced;
};

const extractCSSURLs = (html: string, excludedUrls: string[]): string[] => {
  if (!html) return [];

  const parsed = parse(html);

  if (!parsed) return [];

  //get all <link> tags
  const links = (parsed.querySelectorAll("link").map((x) => x.getAttribute("href")) as string[]) || [];
  if (!links) return [];

  //filter and return only CSS links .min.css or .css starting with http
  const cssLinks = links.filter((x) => x.startsWith("http") && (x.includes(".css") || x.includes(".min.css")));

  //remove excluded files based on what the excludedUrls array holds.
  const permittedURLs = cssLinks.filter((url) => !excludedUrls.some((excludedUrl) => url.includes(excludedUrl)));

  return permittedURLs;
};

const removeComments = async (html: string): Promise<string> => {
  const regex = /<!--(.|\s)*?-->/;
  const replacedContent = html.replace(regex, "");
  return replacedContent;
};

const retrieveCSSFromTags = async (rawHTML: string): Promise<string> => {
  const parsedHTML = parse(rawHTML);
  const styleTags = parsedHTML.querySelectorAll("style");

  if (!styleTags) return "";

  const css = styleTags.map((tag) => tag.innerHTML).join("\n\n\n");

  return css.replace(/\/\*[^*]*\*+([^/][^*]*\*+)*\//g, "");
};

export { fetchText, retrieveCSSFiles, extractCSSURLs, removeComments, retrieveCSSFromTags };
