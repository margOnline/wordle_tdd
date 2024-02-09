import { mount } from '@vue/test-utils'
import WordleBoard from '../WordleBoard.vue'
import { VICTORY_MESSAGE, UNSUCCESSFUL_MESSAGE, WORD_SIZE, MAX_NUM_OF_GUESSES } from "../../settings";
import { beforeEach } from "vitest"
import GuessView from '../GuessView.vue';

describe('WordleBoard', () => {
  let wordOfTheDay = "TESTS"
  let wrapper: ReturnType<typeof mount>;

  beforeEach((): void => {
    wrapper = mount(WordleBoard, { props: { wordOfTheDay }})
  })

  async function playerTypesGuess(guess:string) {
    await wrapper.find("input[type=text").setValue(guess)
  }

  async function playerPressesEnter() {
    await wrapper.find("input[type=text").trigger("keydown.enter")
  }

  async function playerTypesAndSubmitsGuess(guess: string) {
    await playerTypesGuess(guess)
    await playerPressesEnter()
  }
  describe("end of game messages", () => {
    test("a victory message appears when the user makes a guess that matches the word of the day", async():Promise<void> => {
      await playerTypesAndSubmitsGuess(wordOfTheDay)
  
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
          await playerTypesAndSubmitsGuess("WRONG")
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
      await playerTypesAndSubmitsGuess("WRONG")

      expect(wrapper.find<HTMLInputElement>("input[type=text]").element.value).toContain("")
    })

    test(`player guesses are limited to ${WORD_SIZE} letters`, async() => {
      await playerTypesAndSubmitsGuess(wordOfTheDay + "EXTRA");

      expect(wrapper.text()).toContain(VICTORY_MESSAGE);
    })
    test("player guesses can only be submitted if they are a real world", async() => {
      await playerTypesAndSubmitsGuess("QWERT");

      expect(wrapper.text()).not.toContain(VICTORY_MESSAGE);
      expect(wrapper.text()).not.toContain(UNSUCCESSFUL_MESSAGE);
    })
    test("player guesses are not case sensitive", async() => {
      await playerTypesAndSubmitsGuess(wordOfTheDay.toLowerCase());

      expect(wrapper.text()).toContain(VICTORY_MESSAGE);
    })
    test("player guesses can only contain letters", async() => {
      await playerTypesGuess("H!R4T");

      expect(wrapper.find<HTMLInputElement>('input[type=text]').element.value).toEqual("HRT")
    })

    test("non-letter characters do not render while being typed", async() => {
      await playerTypesGuess("33")
      await playerTypesGuess("122")

      expect(wrapper.find<HTMLInputElement>('input[type=text]').element.value).toEqual("")
    })

    test("all previous guesses made by the player are visible", async() => {
      const guesses = ["GUESS", "WRONG", "HELLO", "WORLD", "HAPPY", "CODER"]

      for (const guess of guesses){
        await playerTypesAndSubmitsGuess(guess)
      }

      for (const guess of guesses) {
        expect(wrapper.text()).toContain(guess)
      }
    })

    test("if the game is over, prohibit any more guesses", async() => {
      const guesses = ["GUESS", "WRONG", "HELLO", "WORLD", "HAPPY", "CODER"]

      for (const guess of guesses){
        await playerTypesAndSubmitsGuess(guess)
      }

      expect(wrapper.find<HTMLInputElement>("input[type=text]")).toBeUndefined
    })
  })

  describe(`There should always be ${MAX_NUM_OF_GUESSES} guess views displayed`, () => {
    test("at the start of the game", async() => {
      expect(wrapper.findAllComponents(GuessView)).toHaveLength(MAX_NUM_OF_GUESSES)
    })

    test(`when the player wins the game`, async() => {
      await playerTypesAndSubmitsGuess(wordOfTheDay)
      expect(wrapper.findAllComponents(GuessView)).toHaveLength(MAX_NUM_OF_GUESSES)
    })

    test(`when the player loses the game`, async() => {
      const guesses = ["WORLD", "CODER", "HOUSE", "HAPPY", "ABIDE", "TRIAL"]
      
      for (const guess in guesses) {
        await playerTypesAndSubmitsGuess(guess)
        expect(wrapper.findAllComponents(GuessView)).toHaveLength(MAX_NUM_OF_GUESSES)
      }
    })
  })

  describe("Providing hints/feedback to the player", () => {
    test("hints are not displayed before the player starts typing their guess", async () => {
      expect(wrapper.find("[data-letter-feedback]").exists()).toBe(false)
    })

    test("hints are not displayed while the player types their guess", async () => {
      await playerTypesGuess(wordOfTheDay)
      expect(wrapper.find("[data-letter-feedback]").exists()).toBe(false)
    })

    test("hints are not displayed while the player types their guess", async () => {
      await playerTypesAndSubmitsGuess(wordOfTheDay)
      expect(wrapper.find("[data-letter-feedback]").exists()).toBe(true)
    })
  })

  describe.each([
    {
      position: 0,
      expectedFeedback: "correct",
      reason: "W is in the word of the day and in the correct position"
    },
    {
      position: 1,
      expectedFeedback: "almost",
      reason: "R is in the word of the day but in wrong position"
    },
    {
      position: 2,
      expectedFeedback: "almost",
      reason: "O is in the word of the day but in the wrong position"
    },
    {
      position: 3,
      expectedFeedback: "incorrect",
      reason: "N is not in the word of the day"
    },
    {
      position: 4,
      expectedFeedback: "incorrect",
      reason: "G is not in the word of the day"
    }
  ])("If the word of the day is WORLD and the player submits 'wrong'", ({ position, expectedFeedback, reason }) => {
    const wordOfTheDay = "WORLD"
    const guess = "WRONG"

    test.skipIf(expectedFeedback === "almost")(`the feedback for '${guess[position]}' (index: ${position}) should be '${expectedFeedback}' because '${reason}'`, async() => {
      wrapper = mount(WordleBoard, { props: { wordOfTheDay } })
      await playerTypesAndSubmitsGuess(guess)

      const feedback = wrapper.findAll("[data-letter]").at(position)?.attributes("data-letter-feedback")
      expect(feedback).toEqual(expectedFeedback)
    })
  })
  
})
