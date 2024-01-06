import { DOMWrapper, mount } from '@vue/test-utils'
import WordleBoard from '../WordleBoard.vue'
import { VICTORY_MESSAGE, UNSUCCESSFUL_MESSAGE } from "../../settings";

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

  test("A warning is emitted if a guess is submitted without 5 letters", async():Promise<void> => {
    console.warn = vi.fn();

    mount(WordleBoard, { props:{ wordOfTheDay: 'fly'}})

    expect(console.warn).toHaveBeenCalled()

  })

  test("A warning is emitted if a guess is submitted all capital letters", async():Promise<void> => {
    console.warn = vi.fn();

    mount(WordleBoard, { props:{ wordOfTheDay: 'flyer'}})

    expect(console.warn).toHaveBeenCalled()

  })

  test("A warning is emitted if the guess submitted is not a real world", async():Promise<void> => {
    console.warn = vi.fn();

    mount(WordleBoard, { props:{ wordOfTheDay: 'FLFLF'}})

    expect(console.warn).toHaveBeenCalled()

  })

  test("No warning is emitted if the provide word of the day is not a real word", async():Promise<void> => {
    console.warn = vi.fn();

    mount(WordleBoard, { props:{ wordOfTheDay: 'WORKS'}})

    expect(console.warn).not.toHaveBeenCalled()

  })
})
