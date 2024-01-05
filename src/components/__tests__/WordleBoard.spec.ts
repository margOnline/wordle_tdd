import { DOMWrapper, mount } from '@vue/test-utils'
import WordleBoard from '../WordleBoard.vue'

describe('WordleBoard', () => {
  test("a victory message appears when the user makes a guess that matches theword of the day", async():Promise<void> => {
    const wrapper = mount(WordleBoard, { props: { wordOfTheDay: "TESTS"}})

    const guessInput:DOMWrapper<Element> = wrapper.find("input[type=text")
    await guessInput.setValue("TESTS")
    await guessInput.trigger("keydown.enter")

    expect(wrapper.text()).toContain("You won!")
  })
})
