import { replaceAll } from "./replace_all"

export function scrollToThing(block_id: string) {
  let things = document.getElementsByClassName("block")
  Array.from(things).forEach((this_thing: Element) => {
    (this_thing as HTMLElement).style.removeProperty("animation")
  })

  let thing = document.getElementById(block_id)
  if (thing == null) {
    thing = (Array.from(things).find(this_thing => replaceAll(this_thing.id, "-", "") == block_id.toLowerCase()) as HTMLElement)
  }
  if (thing == null) {
    thing = (Array.from(things).find(this_thing => this_thing.getAttribute("readable_id") == block_id.toLowerCase()) as HTMLElement)
  }

  if (thing != null) {
    window.history.replaceState( {} , (thing.getAttribute("readable_id") || ""), "/?scrollTo="+ (thing.getAttribute("readable_id") || "") )
  }

  thing?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
  
  (thing as HTMLElement).style.setProperty("animation", "400ms ease-in-out 0s 5 alternate both running flash")
  // console.log((thing as HTMLElement).style)
}