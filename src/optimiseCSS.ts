import fs from "fs/promises";
import { PurgeCSS } from "purgecss";
import { v4 as uuidv4 } from "uuid";
import postcss from "postcss";
import cssnano from "cssnano";
import path from "path";
import { fetchText, removeComments, extractCSSURLs, retrieveCSSFiles, retrieveCSSFromTags } from "./utils";
/*
- Fetch a web URL as HTML
- Using a regex, extract all CSS URLs
- Fetch all CSS URLs
- Also fetch css inside <style> tags on page
- remove comments from the original HTML, and comments from the CSS
- Save the CSS to a file as a benchmark to measure against and to avoid storing it in large memory amount
- Purge the CSS using the HTML as our context
- Save the purged CSS to a file
- Excluded filenames will be passed as a get param to the endpoint

*/

const optimseCSS = async (url: string, excludedFiles: string[]): Promise<string> => {
  const html = await fetchText(url);
  const rawHTML = await removeComments(html);

  const cssURLs = await extractCSSURLs(rawHTML, excludedFiles);
  const css = await retrieveCSSFiles(cssURLs);
  // const inlineCSS = await retrieveCSSFromTags(rawHTML);
  await fs.writeFile("all.css", css.join("\n\n"));

  const reducedCSS = await new PurgeCSS().purge({
    content: [
      {
        raw: html,
        extension: "html",
      },
    ],
    css: ["all.css"],
  });

  const filename = `${uuidv4()}.css`;

  const optimised = await postcss([cssnano()]).process(reducedCSS[0].css, { from: undefined });
  await fs.writeFile(path.resolve(`${process.env.DEST_DIR}/${filename}`), optimised.css);

  return filename;
};

export default optimseCSS;
