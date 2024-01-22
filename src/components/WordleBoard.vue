<script setup lang="ts">
import { ref } from "vue"
import { VICTORY_MESSAGE, UNSUCCESSFUL_MESSAGE } from "@/settings";
import englishWords from "@/wordleWordList.json"
import GuessInput from "@/components/GuessInput.vue"

defineProps({
  wordOfTheDay: {
    type: String,
    validator: (wordGiven: string) => englishWords.includes(wordGiven)
  }
})

const guessSubmitted = ref("")

</script>

<template>
  <guess-input @guess-submitted="(guess:string) => guessSubmitted =guess"/>
  <p
    v-if="guessSubmitted.length > 0"
    v-text="guessSubmitted === wordOfTheDay ? VICTORY_MESSAGE :  UNSUCCESSFUL_MESSAGE"
  />   
</template>
