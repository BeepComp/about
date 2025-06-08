import "dotenv/config"

import { BlockObjectRequest, BlockObjectResponse, Client, ListBlockChildrenResponse } from '@notionhq/client'

import fs from "fs/promises"

export interface IProcessEnv {
  NOTION_SECRET: string;
  NOTION_PAGE_ID: string;
}

declare global {
  namespace NodeJS {
    interface ProcessEnv extends IProcessEnv { }
  }
}

const notion = new Client({auth: process.env.NOTION_SECRET})

const starter_id = process.env.NOTION_PAGE_ID
var OUTPUT: any[] = [] // <- weird map thing I can put into a json

/*
[
  ["7th Tournament", [
    ["Overview", [
      "...",
      "...",
      "..."
    ]],
    ["Rounds", [
      "...",
      "...",
      ["Open-Period", [
        "...",
        "...",
        "..."
      ]],
      ["Voting-Period", [
        "...",
        "...",
        "..."
      ]],
      ["Finished-State", [
        "...",
        "...",
        "..."
      ]]
    ]],
    ["Overview", [
      "...",
      "...",
      "..."
    ]]
  ]]
]
*/

declare global {
  interface Array<T> {
      awaitForEach(func: Function): Promise<T[]>;
      asyncForEach(func: Function): Promise<T[]>;
  }
}

Array.prototype.awaitForEach = async function(func) {
	var proms: (Promise<any> | null)[] = []

	this.forEach((...args) => {
		proms.push(func(...args))
	})

	return await Promise.all(proms)
}

Array.prototype.asyncForEach = async function(func) {
	var i = 0
	var length = this.length
	var funcs: Function[] = []
	var reses: any[] = []
	return new Promise(async (res, rej) => {
		this.forEach((...args) => {
			funcs.push(func.bind(this, ...args))
		})

		async function loop() {
			var this_res = await funcs[i]()
			reses.push(this_res)
			i++
			if (i == length) {
				res(reses)
			} else {
				loop()
			}
		}
		loop()
	})
}

let all_classes = new Set()
function parseAnnotations(entry: any): {raw: string, html: string} {
  let raw = (
    entry.type =="text" ? entry.text.content :
    entry.type =="equation" ? entry.equation.expression :
    ""
  )
  let html = raw

  let classes: string[] = []
  Object.keys(entry.annotations).forEach(annotation => {
    let value = entry.annotations[annotation]
    switch (annotation) {
      case "color":
        classes.push("color-" + value)
        all_classes.add("color-" + value)
      break;
      default: 
        if (value == true) {
          classes.push(annotation)
          all_classes.add(annotation)
        }
    }
  })

  if (classes.length > 0) {
    html = `<span class="${classes.join(" ")}">${raw}</span>`
  }

  if (entry.href) {
    let href = entry.href
    if (entry.href.startsWith("/")) { href = "/?scrollTo=" + href.split("#")[1] }
    html = `<a ${entry.href.startsWith("/") ? `class="inline-jump"`: ''} href=${href}>${html}</a>`
  }

  return {raw, html}
}

function parseRichText(rich_text: any, block: any = null): {raw: string, html: string, is_toggleable: boolean} {
  let res = {raw: "", html: "", is_toggleable: false}

  res.is_toggleable = (block[block.type]?.is_toggleable != null ? block[block.type].is_toggleable : false)
  try {
    res.raw = (rich_text.map((entry: any) => parseAnnotations(entry).raw).join(""))
    res.html = (rich_text.map((entry: any) => parseAnnotations(entry).html).join(""))
  } catch (err) {
    if (block.type == "equation") {
      res.raw = block[block.type].expression
      res.html = block[block.type].expression
    } else {
      console.log("naw: ", block, err)
      res = {raw: "", html: "", is_toggleable: res.is_toggleable}
    }
  }
  
  return res
}

let types = new Set()
async function main() {
  async function parseBlocks(block_id: string): Promise<any> {
    let block: any = (await notion.blocks.retrieve({block_id}) as BlockObjectResponse)
    
    // console.log(block)
    if (block_id == starter_id) {
      let blocks: ListBlockChildrenResponse = (await notion.blocks.children.list({block_id}) as ListBlockChildrenResponse)
      // console.log(blocks)
      
      let children: any[] = []
      children = await blocks.results.awaitForEach(async (block: any) => parseBlocks(block.id))

      OUTPUT = children
    } else {
      let richTextParse: any = parseRichText(block[block.type].rich_text, block)
      let this_key = richTextParse.raw
      // console.log("GETTING: ", this_key)

      let children: any[] = []
      if (block.has_children) {
        let blocks: ListBlockChildrenResponse = (await notion.blocks.children.list({block_id}) as ListBlockChildrenResponse)
        // console.log(`GOT ${this_key}: `, blocks)
        
        children = await blocks.results.awaitForEach(async (block: any) => parseBlocks(block.id))
      }

      types.add(block.type)

      if (richTextParse.is_toggleable) { richTextParse["readable_id"] = richTextParse.raw.replaceAll(" ", "-").toLowerCase() }

      return Object.assign(richTextParse, {id: block.id, drop_down: richTextParse.is_toggleable, children, type: block.type, _block: block})
    }
  }

  await parseBlocks(starter_id)
  console.log(OUTPUT)
  console.log("ALL TYPES: ", types)
  console.log("ALL CLASSES: ", all_classes)
  fs.writeFile("./src/siteData.json", JSON.stringify(OUTPUT, null, 2), { encoding: 'utf8' })
}

main()
console.log("Fetching Notion Data...")

if (process.env.NODE_ENV == "dev") {
  console.log("works. (dev mode)")
  setInterval(() => {}, 100)
}