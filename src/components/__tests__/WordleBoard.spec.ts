import { DOMWrapper, mount } from '@vue/test-utils'
import WordleBoard from '../WordleBoard.vue'
import { VICTORY_MESSAGE, UNSUCCESSFUL_MESSAGE } from "../../settings";
import { beforeEach } from "vitest"

describe('WordleBoard', () => {
  let wordOfTheDay = "TESTS"
  let wrapper: ReturnType<typeof mount>;

  beforeEach((): void => {
    wrapper = mount(WordleBoard, { props: { wordOfTheDay }})
  })

  async function playerSubmitsGuess(guess: string) {
    const guessInput:DOMWrapper<Element> = wrapper.find("input[type=text")
    await guessInput.setValue(guess)
    await guessInput.trigger("keydown.enter")
  }
  describe("end of game messages", () => {
    test("a victory message appears when the user makes a guess that matches the word of the day", async():Promise<void> => {
      await playerSubmitsGuess(wordOfTheDay)
  
      expect(wrapper.text()).toContain(VICTORY_MESSAGE)
    })
  
    test("a defeat message is displayed if the user enters a guess that is incorrect", async():Promise<void> => {
      await playerSubmitsGuess("wrong")
  
      expect(wrapper.text()).toContain(UNSUCCESSFUL_MESSAGE)
    })
  
    test("no end of game messages appears if the user has not made any guesses", async():Promise<void> => {
      expect(wrapper.text()).not.toContain(VICTORY_MESSAGE)
      expect(wrapper.text()).not.toContain(UNSUCCESSFUL_MESSAGE)
    })
  })
  
  describe("Rules for defining the 'word of the day'", () => {
    beforeEach(() => {
      console.warn = vi.fn();
    })

    test.each(
      [
        {wordOfTheDay: "FLY", reason: "word-of-the-day must have 5 characters"},
        {wordOfTheDay: "tests", reason: "word-of-the-day must be all in uppercase"},
        {wordOfTheDay: "QWERT", reason: "word-of-the-day must be a valid English word"}
      ]
    )("Since $reason: $wordOfTheDay is invalid, therefore a warning must be emitted", async({ wordOfTheDay }):Promise<void> => {
      mount(WordleBoard, {props: {wordOfTheDay}})

      expect(console.warn).toHaveBeenCalled()  
    })

    test("No warning is emitted if the provided word of the day is a real word", async():Promise<void> => {
      console.warn = vi.fn();
  
      mount(WordleBoard, { props:{ wordOfTheDay: 'WORKS'}})
  
      expect(console.warn).not.toHaveBeenCalled()
  
    })
  })
  describe("Player input", () => {
    test("player guesses are limited to 5 letters", async() => {
      await playerSubmitsGuess(wordOfTheDay + "EXTRA");

      expect(wrapper.text()).toContain(VICTORY_MESSAGE);
    })
    test.todo("player guesses can only be submitted if they are a real world")
    test.todo("player guesses are not case sensitive")
    test.todo("player guesses can only contain letters")
  })
  
})
