<script setup lang="ts">
import { ref, computed } from "vue"
import { VICTORY_MESSAGE, UNSUCCESSFUL_MESSAGE } from "@/settings";
import englishWords from "@/wordleWordList"

defineProps({
  wordOfTheDay: {
    type: String,
    validator: (wordGiven: string) => englishWords.includes(wordGiven)
  }
})

const guessInProgress = ref("")
const guessSubmitted = ref("")
const formattedGuessInProgress = computed({
  get() {
    return guessInProgress.value
  },
  set(rawValue: string) {
    guessInProgress.value = rawValue.slice(0,5)
  }
})
</script>

<template>
  <input
    type="text"
    maxlength="5"
    v-model="formattedGuessInProgress"
    @keydown.enter="guessSubmitted=guessInProgress"
  >
  <p
    v-if="guessSubmitted.length > 0"
    v-text="guessSubmitted === wordOfTheDay ? VICTORY_MESSAGE :  UNSUCCESSFUL_MESSAGE"
  />   
</template>
