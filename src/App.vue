<script setup lang="ts">
import { onMounted } from 'vue';
import BlockRenderer from './components/BlockRenderer.vue'
import HeaderButton from './components/HeaderButton.vue'
import { SITE_DATA } from './modules/site_data';
import logo from "/beepcomp_logo.svg?url"
import { scrollToThing } from './modules/scroll_thing';
import { replaceAll } from './modules/replace_all';

onMounted(() => {
  var query_params = new URLSearchParams(window.location.search)

  if (query_params.has("scrollTo")) {
    let thing_id: string = (query_params.get("scrollTo") as string)
    scrollToThing(thing_id)
    setTimeout(() => { scrollToThing(thing_id) }, 100)
  }

  let things = document.getElementsByClassName("block");

  (Array.from(document.getElementsByClassName("inline-jump")) as HTMLAnchorElement[]).forEach(anchor => {
    let block_id = anchor.href.split("=")[1]

    let thing = document.getElementById(block_id)
    if (thing == null) {
      thing = (Array.from(things).find(this_thing => replaceAll(this_thing.id, "-", "") == block_id.toLowerCase()) as HTMLElement)
    }
    if (thing == null) {
      thing = (Array.from(things).find(this_thing => this_thing.getAttribute("readable_id") == block_id.toLowerCase()) as HTMLElement)
    }

    if (thing != null) {
      anchor.href = "?scrollTo=" + thing.getAttribute("readable_id")
      anchor.onclick = e => {
        e.preventDefault();
        e.stopPropagation();

        scrollToThing(thing.id)
      }
    }
  })
})
</script>

<template>
<div id="whole">
  <div id="main-content">
    <BlockRenderer v-for="block in SITE_DATA" :block="block"></BlockRenderer>
  </div>
  <div id="sidebar">
    <p id="title"><img id="logo" :src="logo"></img>BeepComp About</p>
    <HeaderButton v-for="block in SITE_DATA.filter(this_block => this_block.drop_down)" :block="block"></HeaderButton>
  </div>
</div>
</template>

<style scoped>
#whole {
  width: 100%;
  height: 100%;
  display: flex;
  --sidebar-width: 350px;
  gap: 30px;
}

#sidebar {
  width: var(--sidebar-width);
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: scroll;
  overflow-x: none;
}

#logo {
  width: 48px;
  height: 48px;
}

#title {
  display: flex;
  gap: 5px;
  font-family: BakbakOne;
  color: white;
  font-size: 32px;
  margin: 0px;
  opacity: 1.0;
}

#main-content {
  width: calc(100% - var(--sidebar-width));
  height: 100%;
  overflow-y: scroll;
  overflow-x: hidden;
}
</style>
