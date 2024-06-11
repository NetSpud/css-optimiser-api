const url = "http://localhost:8000/?performance_mode=false";
const { parse } = require("node-html-parser");
const postcss = require("postcss");
const cssnano = require("cssnano");
const path = require("path");

class CSSOptimisation {
    constructor(url) {
        this.url = url;
        this.pageContent = this.fetchContent(url)
        this.stylesheetURLs = this.fetchStylesheetURLs();
        this.stylesheets = this.fetchStylesheets();

    }
    async fetchContent(url) {
        const f = await fetch(url);
        const t = await f.text();
        return t;
    }
    async fetchStylesheetURLs() {
        const root = parse(await this.pageContent);
        const links = (root.querySelectorAll("link").map((x) => x.getAttribute("href")));
        if (!links) return [];

        //filter and return only CSS links .min.css or .css starting with http
        const cssLinks = links.filter((x) => x.startsWith("http") && (x.includes(".css") || x.includes(".min.css")));

        return cssLinks;
    }
    async fetchStylesheets() {
        const r = [];
        for (const stylesheet of await this.stylesheetURLs) {
            const css = await this.fetchContent(stylesheet);

            console.log(css)
            const o = new CSSFile(css);
            o.process();

            const t = {
                filename: path.basename(stylesheet),
                optimised: o.retrieveOptimised,
                errors: o.showerrors
            }
            r.push(t);
        }
        return r;
    }
}


class CSSFile {
    constructor(css) {
        this.css = css;
        this.errors = [];
        this.optimisedCSS = "";
        this.process();
    }
    process() {
        console.log("CSSFile process()")
        postcss([cssnano])
            .process(this.css, { from: undefined })
            .then((result) => {
                this.optimisedCSS = result.css;
            })
            .catch((error) => {
                this.errors.push(error);
            });
    }
    get retrieveOptimised() {
        return this.optimisedCSS;
    }
    get showerrors() {
        return this.errors;
    }


}

const op = new CSSOptimisation(url);

op.stylesheets.then(x => console.log(x))




