var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import "dotenv/config";
import { Client } from '@notionhq/client';
import fs from "fs/promises";
const notion = new Client({ auth: process.env.NOTION_SECRET });
const starter_id = process.env.NOTION_PAGE_ID;
var OUTPUT = []; // <- weird map thing I can put into a json
Array.prototype.awaitForEach = function (func) {
    return __awaiter(this, void 0, void 0, function* () {
        var proms = [];
        this.forEach((...args) => {
            proms.push(func(...args));
        });
        return yield Promise.all(proms);
    });
};
Array.prototype.asyncForEach = function (func) {
    return __awaiter(this, void 0, void 0, function* () {
        var i = 0;
        var length = this.length;
        var funcs = [];
        var reses = [];
        return new Promise((res, rej) => __awaiter(this, void 0, void 0, function* () {
            this.forEach((...args) => {
                funcs.push(func.bind(this, ...args));
            });
            function loop() {
                return __awaiter(this, void 0, void 0, function* () {
                    var this_res = yield funcs[i]();
                    reses.push(this_res);
                    i++;
                    if (i == length) {
                        res(reses);
                    }
                    else {
                        loop();
                    }
                });
            }
            loop();
        }));
    });
};
let all_classes = new Set();
function parseAnnotations(entry) {
    let raw = (entry.type == "text" ? entry.text.content :
        entry.type == "equation" ? entry.equation.expression :
            "");
    let html = raw;
    let classes = [];
    Object.keys(entry.annotations).forEach(annotation => {
        let value = entry.annotations[annotation];
        switch (annotation) {
            case "color":
                classes.push("color-" + value);
                all_classes.add("color-" + value);
                break;
            default:
                if (value == true) {
                    classes.push(annotation);
                    all_classes.add(annotation);
                }
        }
    });
    if (classes.length > 0) {
        html = `<span class="${classes.join(" ")}">${raw}</span>`;
    }
    if (entry.href) {
        let href = entry.href;
        if (entry.href.startsWith("/")) {
            href = "/?scrollTo=" + href.split("#")[1];
        }
        html = `<a${entry.href.startsWith("/") ? ` class="inline-jump"` : ' target="_blank"'} href=${href}>${html}</a>`;
    }
    return { raw, html, has_equation: (entry.type == "equation") };
}
function parseRichText(rich_text, block = null) {
    var _a;
    let res = { raw: "", html: "", is_toggleable: false, has_equation: false };
    res.is_toggleable = (((_a = block[block.type]) === null || _a === void 0 ? void 0 : _a.is_toggleable) != null ? block[block.type].is_toggleable : false);
    try {
        let annotations = rich_text.map((entry) => {
            let annotation = parseAnnotations(entry);
            if (annotation.has_equation) {
                res.has_equation = true;
            }
            return annotation;
        });
        res.raw = annotations.map((annotation) => annotation.raw).join("");
        res.html = annotations.map((annotation) => annotation.html).join("");
    }
    catch (err) {
        if (block.type == "equation") {
            res.raw = block[block.type].expression;
            res.html = block[block.type].expression;
        }
        else {
            console.log("naw: ", block, err);
            res = { raw: "", html: "", is_toggleable: res.is_toggleable, has_equation: false };
        }
    }
    return res;
}
let types = new Set();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        function parseBlocks(block_id) {
            return __awaiter(this, void 0, void 0, function* () {
                let block = yield notion.blocks.retrieve({ block_id });
                // console.log(block)
                if (block_id == starter_id) {
                    let blocks = yield notion.blocks.children.list({ block_id });
                    // console.log(blocks)
                    let children = [];
                    children = yield blocks.results.awaitForEach((block) => __awaiter(this, void 0, void 0, function* () { return parseBlocks(block.id); }));
                    OUTPUT = children;
                }
                else {
                    let richTextParse = parseRichText(block[block.type].rich_text, block);
                    let this_key = richTextParse.raw;
                    if (richTextParse.has_equation) {
                        block.type = block.type + "_equation";
                    }
                    // console.log("GETTING: ", this_key)
                    let children = [];
                    if (block.has_children) {
                        let blocks = yield notion.blocks.children.list({ block_id });
                        // console.log(`GOT ${this_key}: `, blocks)
                        children = yield blocks.results.awaitForEach((block) => __awaiter(this, void 0, void 0, function* () { return parseBlocks(block.id); }));
                    }
                    types.add(block.type);
                    if (richTextParse.is_toggleable) {
                        richTextParse["readable_id"] = richTextParse.raw.replaceAll(" ", "-").toLowerCase();
                    }
                    return Object.assign(richTextParse, { id: block.id, drop_down: richTextParse.is_toggleable, children, type: block.type, _block: block });
                }
            });
        }
        yield parseBlocks(starter_id);
        console.log(OUTPUT);
        console.log("ALL TYPES: ", types);
        console.log("ALL CLASSES: ", all_classes);
        fs.writeFile("./src/siteData.json", JSON.stringify(OUTPUT, null, 2), { encoding: 'utf8' });
    });
}
main();
console.log("Fetching Notion Data...");
if (process.env.NODE_ENV == "dev") {
    console.log("works. (dev mode)");
    setInterval(() => { }, 100);
}
