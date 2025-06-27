<script setup lang="ts">
import { onMounted } from 'vue';
import { scrollToThing } from '../modules/scroll_thing';

const props = defineProps<{ block: any }>();
onMounted(() => {
  // console.log(props.block)
})
</script>

<template>
<button class="sidebar-button" :id="`sidebar-button-${block.id}`" @click="scrollToThing(block.id)">
  <span v-html="block.html"></span>
</button>
<div class="sub-content">
  <SidebarButton v-for="sub_block in block.children.filter((this_block: any) => this_block.drop_down)" :block="sub_block"></SidebarButton>
</div>
</template>

<style scoped>
.sub-content {
  padding-left: 60px;
  display: flex;
  flex-direction: column;
}
</style>
