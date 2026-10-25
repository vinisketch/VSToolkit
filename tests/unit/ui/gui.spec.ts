import assert from 'assert';

import '../../dom';
import '../../di_config';

import type { GuiTest } from '../../gui/tests/gui-test';
import button from '../../gui/tests/button';
import slider from '../../gui/tests/slider';
import progressBar from '../../gui/tests/progress-bar';
import magnets from '../../gui/tests/magnets';
import showHide from '../../gui/tests/show-hide';
import animateParSeq from '../../gui/tests/animate-par-seq';
import svg from '../../gui/tests/svg';
import templateMvc from '../../gui/tests/template-mvc';

const TESTS: GuiTest[] = [button, slider, progressBar, magnets, showHide, animateParSeq, svg, templateMvc];

/**
 * The visual tests (tests/gui, npm run gui) run in a browser; here they
 * only have to run and stop without error.
 */
describe('gui tests', function () {
  const error = console.error;

  beforeEach(function () {
    // the svg files are not served
    console.error = () => {};
  });

  afterEach(function () {
    console.error = error;
    document.body.innerHTML = '';
  });

  for (const test of TESTS) {
    it(`should run and stop ${test.name}`, async function () {
      const container = document.createElement('div');
      document.body.appendChild(container);
      const stop = test.run(container);
      assert.ok(container.childElementCount > 0, 'the test draws views');
      await new Promise(resolve => setTimeout(resolve, 20));
      stop?.();
    });
  }

  it('should display the contacts of template_mvc, following their models', function () {
    const container = document.createElement('div');
    const stop = templateMvc.run(container);
    const texts = (selector: string) => [...container.querySelectorAll(selector)].map(node => node.textContent);
    assert.deepStrictEqual(texts('.name'), ['John DoeDoe', 'Jo DoeDoe']);
    assert.deepStrictEqual(texts('.comp'), ['IBM', 'IBM']);
    assert.deepStrictEqual(texts('.tel > div'), ['34 8984 4380', '34 8984 4380', '34 8984 4389']);
    assert.match(container.querySelector('img')!.getAttribute('src')!, /35834939/);
    stop?.();
  });

  it('should have unique names', function () {
    assert.strictEqual(new Set(TESTS.map(test => test.name)).size, TESTS.length);
  });
});
