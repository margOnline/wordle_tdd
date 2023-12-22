<script setup lang="ts">
defineProps<{
  msg: string
}>()
</script>

<template>
  <p class="green">{{ msg }}</p>    
</template>
