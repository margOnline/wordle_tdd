<script setup lang="ts">
import { ref } from "vue"
import { VICTORY_MESSAGE, UNSUCCESSFUL_MESSAGE } from "@/settings";
import englishWords from "@/wordleWordList"

defineProps({
  wordOfTheDay: {
    type: String,
    validator: (wordGiven: string) => wordGiven.length === 5
      && wordGiven.toUpperCase() === wordGiven
      && englishWords.includes(wordGiven)
  }
})

const guessInProgress = ref("")
const guessSubmitted = ref("")
</script>

<template>
  <input type="text" v-model="guessInProgress" @keydown.enter="guessSubmitted=guessInProgress">
  <p
    v-if="guessSubmitted.length > 0"
    v-text="guessSubmitted === wordOfTheDay ? VICTORY_MESSAGE :  UNSUCCESSFUL_MESSAGE"
  />   
</template>
