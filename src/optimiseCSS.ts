import fs from "fs/promises";
import { PurgeCSS } from "purgecss";
import { v4 as uuidv4 } from "uuid";
import postcss from "postcss";
import cssnano from "cssnano";
import path from "path";
import { fetchText, removeComments, extractCSSURLs, retrieveCSSFiles, retrieveCSSFromTags } from "./utils";

class CSSOptimizer {
  private url: string;
  private excludedFiles: string[];

  constructor(url: string, excludedFiles: string[]) {
    this.url = url;
    this.excludedFiles = excludedFiles;
  }

  public async optimize(): Promise<string> {
    const html = await this.fetchHTML();
    const rawHTML = await this.removeComments(html);
    const domain = new URL(this.url).host;

    const cssURLs = await this.extractCSSURLs(rawHTML, domain);
    const css = await this.retrieveCSSFiles(cssURLs);

    await this.saveCSSToFile(css);

    const reducedCSS = await this.purgeCSS(html);

    const filename = await this.saveOptimizedCSS(reducedCSS);

    console.log("Completed");
    return filename;
  }

  private async fetchHTML(): Promise<string> {
    return fetchText(this.url);
  }

  private async removeComments(html: string): Promise<string> {
    return removeComments(html);
  }

  private async extractCSSURLs(rawHTML: string, domain: string): Promise<string[]> {
    return extractCSSURLs(rawHTML, domain, this.excludedFiles);
  }

  private async retrieveCSSFiles(cssURLs: string[]): Promise<string[]> {
    return retrieveCSSFiles(cssURLs);
  }

  private async saveCSSToFile(css: string[]): Promise<void> {
    await fs.writeFile("all.css", css.join("\n\n"));
  }

  private async purgeCSS(html: string): Promise<any[]> {
    return new PurgeCSS().purge({
      content: [
        {
          raw: html,
          extension: "html",
        },
      ],
      css: ["all.css"],
    });
  }

  private async saveOptimizedCSS(reducedCSS: any[]): Promise<string> {
    const destinationFolder = `public/`;
    const filename = `${uuidv4()}.css`;

    const optimised = await postcss([cssnano()]).process(reducedCSS[0].css, { from: undefined });
    await fs.writeFile(path.resolve(`${destinationFolder}/${filename}`), optimised.css);
    return filename;
  }
}

export default CSSOptimizer;
