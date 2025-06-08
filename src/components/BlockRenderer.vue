<script setup lang="ts">
import { onMounted } from 'vue';
import { scrollToThing } from '../modules/scroll_thing';

const props = defineProps<{ block: any }>();
onMounted(() => {
  console.log(props.block)
})

function linkClick(e: Event) {
  e.preventDefault()
  // window.location.search = props.block.readable
  scrollToThing(props.block.id)
}
</script>

<template>
<component :is="block.type" :id="block.id" :readable_id="block.readable_id" class="block">
  <a v-if="block.drop_down" :href="`/?scrollTo=${block.readable_id}`" @click="linkClick" class="scroll-to-link">🔗 </a>
  <span v-html="block.html"></span>
  <div class="sub-content">
    <BlockRenderer v-for="sub_block in block.children" :block="sub_block"></BlockRenderer>
  </div>
</component>
</template>

<style scoped>
.sub-content {
  padding-left: 35px;
}

.scroll-to-link {
  color: #252525;
  text-decoration: none;
  opacity: 0.5;
}
</style>
