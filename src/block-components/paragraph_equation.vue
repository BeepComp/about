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
<vue-latex class="equation" :expression="block.raw" :mobile="isMobile"/>
</template>

<style scoped>
.equation {
  opacity: 0.6;
  font-size: 20px !important;
}
.equation[modile=true] {
  font-size: 16px !important;
}
</style>
