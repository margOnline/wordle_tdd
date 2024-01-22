<script setup lang="ts">
import { ref, computed } from "vue"
import { WORD_SIZE } from "@/settings";
import englishWords from "@/wordleWordList.json"

const guessInProgress = ref<string|null>(null)
const emit = defineEmits<{
  "guess-submitted": [guess: string]
}>();
const formattedGuessInProgress = computed<string>({
  get() {
    return guessInProgress.value ?? ""
  },
  set(rawValue: string) {
    guessInProgress.value = null

    guessInProgress.value = rawValue
      .slice(0, WORD_SIZE)
      .toUpperCase()
      .replace(/[^A-Z]+/gi, "")
  }
})

function onSubmit() {
  guessInProgress.value = null;

  if (!englishWords.includes(formattedGuessInProgress.value)) return;

  emit("guess-submitted", formattedGuessInProgress.value);
}
</script>

<template>
  <input
    type="text"
    :maxlength=WORD_SIZE
    v-model="formattedGuessInProgress"
    @keydown.enter="onSubmit"
  >
</template>
