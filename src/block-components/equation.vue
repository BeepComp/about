<script setup lang="ts">
import { inject, onMounted, type Ref } from 'vue';
import { isMobile } from '../modules/is_mobile';

const block = (inject("block") as any)
const hasSlot = (inject("hasSlot") as Ref<Boolean>)

onMounted(() => {
  hasSlot.value = false
})
</script>

<template>
<br>
<vue-latex v-if="isMobile" class="equation" :expression="block.raw" :mobile="isMobile"/>
<vue-latex v-if="!isMobile" class="equation" :expression="block.raw" display-mode :mobile="isMobile"/>
</template>

<style scoped>
/* .equation[modile=true] {
  font-size: 8px !important
} */
.equation {
  font-size: 24px !important;
}
</style>
