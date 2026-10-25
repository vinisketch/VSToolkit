/**
 * Runs the visual tests one by one: the test is drawn next to its reference
 * image, and the tester validates it (✔) or not (✖). index.html?test=<name>
 * runs one test.
 */
import type { GuiTest } from './tests/gui-test';
import button from './tests/button';
import slider from './tests/slider';
import progressBar from './tests/progress-bar';
import magnets from './tests/magnets';
import showHide from './tests/show-hide';
import animateParSeq from './tests/animate-par-seq';
import svg from './tests/svg';
import templateMvc from './tests/template-mvc';

const ALL_TESTS: GuiTest[] = [button, slider, progressBar, magnets, showHide, animateParSeq, svg, templateMvc];

/** the score of a validated test */
const POINTS = 5;

const only = new URLSearchParams(location.search).get('test');
const tests = only ? ALL_TESTS.filter(test => test.name === only) : ALL_TESTS;
const results = new Map<GuiTest, boolean>();

const testView = document.getElementById('test_view')!;
const resultImage = document.querySelector<HTMLImageElement>('#result_view img')!;
const textView = document.getElementById('text_view')!;

let index = -1;
let stop: (() => void) | void;
let styleSheet: HTMLLinkElement | undefined;

function clear(): void {
  stop?.();
  stop = undefined;
  styleSheet?.remove();
  styleSheet = undefined;
  testView.replaceChildren();
}

function showResult(): void {
  clear();
  resultImage.parentElement!.style.display = 'none';
  for (const id of ['button_ok', 'button_not_ok', 'message']) {
    document.getElementById(id)!.style.display = 'none';
  }
  const score = [...results.values()].filter(Boolean).length * POINTS;
  const result = document.createElement('span');
  result.className = 'result';
  result.textContent = `Result: ${score}/${tests.length * POINTS}`;
  textView.replaceChildren(result);
}

function nextTest(): void {
  clear();
  const test = tests[++index];
  if (!test) {
    showResult();
    return;
  }

  resultImage.src = `images/${test.image}`;
  textView.textContent = `${index + 1}/${tests.length} ${test.name}: ${test.description}`;
  if (test.css) {
    styleSheet = document.createElement('link');
    styleSheet.rel = 'stylesheet';
    styleSheet.href = `css/${test.css}`;
    document.head.appendChild(styleSheet);
  }
  stop = test.run(testView);
}

function validate(ok: boolean): void {
  const test = tests[index];
  if (test) results.set(test, ok);
  nextTest();
}

document.getElementById('button_ok')!.addEventListener('click', () => validate(true));
document.getElementById('button_not_ok')!.addEventListener('click', () => validate(false));

if (!tests.length) {
  textView.textContent = `Unknown test '${only}': ${ALL_TESTS.map(test => test.name).join(', ')}`;
} else {
  nextTest();
}
