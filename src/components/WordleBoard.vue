<script setup lang="ts">
import { ref, computed } from "vue"
import { VICTORY_MESSAGE, UNSUCCESSFUL_MESSAGE, MAX_NUM_OF_GUESSES } from "@/settings";
import englishWords from "@/wordleWordList.json"
import GuessInput from "@/components/GuessInput.vue"
import GuessView from "@/components/GuessView.vue"

const props = defineProps({
  wordOfTheDay: {
    type: String,
    required: true,
    validator: (wordGiven: string) => englishWords.includes(wordGiven)
  }
})

const guessesSubmitted = ref<string[]>([])

const isGameOver = computed(() =>
  guessesSubmitted.value.length === MAX_NUM_OF_GUESSES
  || guessesSubmitted.value.includes(props.wordOfTheDay))

</script>

<template>
  <main>
    <ul>
      <li v-for="(guess, index) in guessesSubmitted" :key="`${index}-${guess}`">
        <guess-view :guess="guess"/>
      </li>
    </ul>
    <ul v-if="!isGameOver">
      <li v-for="(_) in Array(MAX_NUM_OF_GUESSES - guessesSubmitted.length).fill('')">
        <guess-input @guess-submitted="(guess:string) => guessesSubmitted.push(guess)"/>
      </li>
    </ul>
    <p
      v-if="isGameOver"
      class="end-of-game-message"
      v-text="guessesSubmitted.includes(wordOfTheDay) ? VICTORY_MESSAGE :  UNSUCCESSFUL_MESSAGE"
    />
  </main>
</template>

<style scoped>
main {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 3rem;
}
ul {
  list-style: none;
  margin: 0;
  padding: 0;
}
li {
  margin-bottom: 0.25rem;
}
.end-of-game-message {
  font-size: 3rem;
  animation: end-of-game-message-animation 700ms forwards;
  white-space: nowrap;
  text-align: center;
}
@keyframes end-of-game-message-animation {
  0% {
    opacity: 0;
    transform: rotateZ(0);
  }
  100% {
    opacity: 1;
    transform: translateY(2rem);
  }
}
</style>
