/**
 * A visual test: it draws views in the container, to compare with its
 * reference image. It returns a function which stops it (timers,
 * animations…).
 */
export interface GuiTest {
  /** the name of the test (index.html?test=<name> runs it alone) */
  name: string;
  /** what to check */
  description: string;
  /** the reference image, in images/ */
  image: string;
  /** a style sheet of the test, in css/ */
  css?: string;
  run(container: HTMLElement): (() => void) | void;
}
