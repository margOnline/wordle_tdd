import { DOMWrapper, mount } from '@vue/test-utils'
import WordleBoard from '../WordleBoard.vue'
import { VICTORY_MESSAGE, UNSUCCESSFUL_MESSAGE, WORD_SIZE, MAX_NUM_OF_GUESSES } from "../../settings";
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
  
    test("no end of game messages appears if the user has not made any guesses", async():Promise<void> => {
      expect(wrapper.text()).not.toContain(VICTORY_MESSAGE)
      expect(wrapper.text()).not.toContain(UNSUCCESSFUL_MESSAGE)
    })

    describe.each([
      {numberOfGuesses: 0, shouldSeeUnsuccessfulMessage: false},
      {numberOfGuesses: 1, shouldSeeUnsuccessfulMessage: false},
      {numberOfGuesses: 2, shouldSeeUnsuccessfulMessage: false},
      {numberOfGuesses: 3, shouldSeeUnsuccessfulMessage: false},
      {numberOfGuesses: 4, shouldSeeUnsuccessfulMessage: false},
      {numberOfGuesses: 5, shouldSeeUnsuccessfulMessage: false},
      {numberOfGuesses:  MAX_NUM_OF_GUESSES, shouldSeeUnsuccessfulMessage: true},
    ])(`a defeat message should appear if the player makes incorrect guesses ${ MAX_NUM_OF_GUESSES} times`, ({numberOfGuesses, shouldSeeUnsuccessfulMessage}) => {
      test(`therefore for ${numberOfGuesses} guess(es) a defeat message should ${shouldSeeUnsuccessfulMessage ? "" : "not"} appear`, async() => {
        for (let i=0; i < numberOfGuesses; i++) {
          await playerSubmitsGuess("WRONG")
        }
        if (shouldSeeUnsuccessfulMessage) {
          expect(wrapper.text()).toContain(UNSUCCESSFUL_MESSAGE)
        } else {
          expect(wrapper.text()).not.toContain(UNSUCCESSFUL_MESSAGE)
        }
      })
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
    test("remains in focus the entire time", async() => {
      document.body.innerHTML = `<div id="app"></div>`
      wrapper = mount(WordleBoard, {
        props: {wordOfTheDay},
        attachTo: "#app"
      })

      expect(wrapper.find("input[type=text]").attributes("autofocus")).not.toBeUndefined()
      await wrapper.find("input[type=text]").trigger("blur")
      expect(document.activeElement).toBe(wrapper.find("input[type=text]").element)
    })

    test("player input is cleared after each submission", async() => {
      await playerSubmitsGuess("WRONG")

      expect(wrapper.find<HTMLInputElement>("input[type=text]").element.value).toContain("")
    })

    test(`player guesses are limited to ${WORD_SIZE} letters`, async() => {
      await playerSubmitsGuess(wordOfTheDay + "EXTRA");

      expect(wrapper.text()).toContain(VICTORY_MESSAGE);
    })
    test("player guesses can only be submitted if they are a real world", async() => {
      await playerSubmitsGuess("QWERT");

      expect(wrapper.text()).not.toContain(VICTORY_MESSAGE);
      expect(wrapper.text()).not.toContain(UNSUCCESSFUL_MESSAGE);
    })
    test("player guesses are not case sensitive", async() => {
      await playerSubmitsGuess(wordOfTheDay.toLowerCase());

      expect(wrapper.text()).toContain(VICTORY_MESSAGE);
    })
    test("player guesses can only contain letters", async() => {
      await playerSubmitsGuess("H!R4T");

      expect(wrapper.find<HTMLInputElement>('input[type=text]').element.value).toEqual("HRT")
    })

    test("non-letter characters do not render while being typed", async() => {
      await playerSubmitsGuess("33")
      await playerSubmitsGuess("122")

      expect(wrapper.find<HTMLInputElement>('input[type=text]').element.value).toEqual("")
    })

    test("all previous guesses made by the player are visible", async() => {
      const guesses = ["GUESS", "WRONG", "HELLO", "WORLD", "HAPPY", "CODER"]

      for (const guess of guesses){
        await playerSubmitsGuess(guess)
      }

      for (const guess of guesses) {
        expect(wrapper.text()).toContain(guess)
      }
    })

    test("if the game is over, prohibit any more guesses", async() => {
      const guesses = ["GUESS", "WRONG", "HELLO", "WORLD", "HAPPY", "CODER"]

      for (const guess of guesses){
        await playerSubmitsGuess(guess)
      }

      expect(wrapper.find<HTMLInputElement>("input[type=text]")).toBeUndefined
    })
  })

  test("The player sees 6 lines of input at the start of the game", async() => {
    const wrapper = mount(WordleBoard, { props: { wordOfTheDay }})

    expect(wrapper.findAll("input[type=text]").length).toEqual(6)
  })

  test("As the game progresses, display number of guesses remaining", async() => {
    const wrapper = mount(WordleBoard, { props: { wordOfTheDay }})
    const guesses = ["GUESS", "WRONG", "HELLO"]

    for (const guess of guesses){
      await playerSubmitsGuess(guess)
    }
    const emptyTiles = wrapper.findAll("input[type=text]").filter(node => node.element.innerHTML === " ")
    console.log("emptyTyiles: ", wrapper.findAll("input[type=text]"))
    expect(emptyTiles.length).toEqual((MAX_NUM_OF_GUESSES - guesses.length) * WORD_SIZE)
  })
  
})
