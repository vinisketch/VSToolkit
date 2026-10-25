import assert from 'assert';

import '../../dom';
import '../../di_config';

import { ScrollView, ScrollImageView, View } from '../../../src/ui';

/** identity comparison (a failing deepStrictEqual on DOM objects hangs) */
function same(actual: unknown, expected: unknown, message?: string): void {
  assert.ok(actual === expected, message ?? 'not the same object');
}

describe('ScrollView', function () {
  afterEach(function () {
    document.body.innerHTML = '';
  });

  function makeScrollView(options = {}) {
    const scrollView = new ScrollView(options);
    scrollView.init();
    const content = scrollView.view!.querySelector<HTMLElement>(':scope > .content')!;
    return { scrollView, content };
  }

  it('should not scroll by default', function () {
    const { scrollView, content } = makeScrollView();
    assert.strictEqual(scrollView.scroll, ScrollView.NO_SCROLL);
    assert.strictEqual(scrollView.view!.style.display, '');
    assert.strictEqual(content.style.overflowY, '');
  });

  it('should scroll its content natively, between its bars', function () {
    const { scrollView, content } = makeScrollView({ scroll: ScrollView.VERTICAL_SCROLL });
    assert.strictEqual(scrollView.view!.style.display, 'flex');
    assert.strictEqual(scrollView.view!.style.flexDirection, 'column');
    assert.strictEqual(content.style.minHeight, '0');
    assert.deepStrictEqual([content.style.overflowX, content.style.overflowY], ['hidden', 'auto']);

    scrollView.scroll = ScrollView.HORIZONTAL_SCROLL;
    assert.deepStrictEqual([content.style.overflowX, content.style.overflowY], ['auto', 'hidden']);
    scrollView.scroll = true;
    assert.strictEqual(scrollView.scroll, ScrollView.SCROLL);
    assert.deepStrictEqual([content.style.overflowX, content.style.overflowY], ['auto', 'auto']);
    scrollView.scroll = 7;
    assert.strictEqual(scrollView.scroll, ScrollView.SCROLL);

    scrollView.scroll = false;
    assert.strictEqual(scrollView.scroll, ScrollView.NO_SCROLL);
    assert.strictEqual(scrollView.view!.style.display, '');
    assert.strictEqual(content.style.overflowY, '');
  });

  it('should keep its flex display when hidden then shown', function () {
    const { scrollView } = makeScrollView({ scroll: ScrollView.SCROLL });
    scrollView.hide();
    assert.strictEqual(scrollView.view!.style.display, 'none');
    scrollView.show();
    assert.strictEqual(scrollView.view!.style.display, 'flex');
  });

  it('should add the children to the content, and the bars to their holes', function () {
    class TopBar extends View { static scrollViewHole = 'top_bar'; }
    const { scrollView, content } = makeScrollView();
    const child = new View();
    child.init();
    const bar = new TopBar();
    bar.init();
    scrollView.add(child);
    scrollView.add(bar, 'children');

    same(child.view!.parentElement, content);
    same(bar.view!.parentElement, scrollView.view!.querySelector('[x-hag-hole="top_bar"]'));
  });

  it('should lay out its content', function () {
    const { scrollView, content } = makeScrollView({ layout: View.VERTICAL_LAYOUT });
    assert.ok(content.classList.contains('vertical_layout'));
    assert.strictEqual(scrollView.hasClassName('vertical_layout'), false);

    const changes: string[][] = [];
    scrollView.on('change', (_view, properties) => changes.push(properties));
    scrollView.layout = View.HORIZONTAL_LAYOUT;
    scrollView.layout = View.HORIZONTAL_LAYOUT;
    assert.strictEqual(content.classList.contains('vertical_layout'), false);
    assert.ok(content.classList.contains('horizontal_layout'));
    assert.deepStrictEqual(changes, [['layout']]);

    const error = console.error;
    console.error = () => {};
    try {
      scrollView.layout = 'diagonal';
    } finally {
      console.error = error;
    }
    assert.strictEqual(scrollView.layout, 'horizontal_layout');
  });

  it('should set the HTML of its content', function () {
    const { scrollView, content } = makeScrollView();
    scrollView.innerHTML = '<p>text</p>';
    assert.strictEqual(content.innerHTML, '<p>text</p>');
    assert.ok(scrollView.view!.querySelector('[x-hag-hole="top_bar"]'), 'the bars are kept');
  });

  it('should scroll to a position', function () {
    const { scrollView, content } = makeScrollView({ scroll: ScrollView.SCROLL });
    const scrolls: ScrollToOptions[] = [];
    content.scrollTo = ((options: ScrollToOptions) => { scrolls.push(options); }) as typeof content.scrollTo;
    scrollView.scrollTo(10, 20);
    scrollView.scrollTo(0, 50, 200);
    assert.deepStrictEqual(scrolls,
      [{ left: 10, top: 20, behavior: 'auto' }, { left: 0, top: 50, behavior: 'smooth' }]);

    content.scrollLeft = 3;
    content.scrollTop = 4;
    assert.deepStrictEqual(scrollView.scrollPosition, [3, 4]);
  });
});

describe('ScrollImageView', function () {
  afterEach(function () {
    document.body.innerHTML = '';
  });

  function makeImage(options = {}) {
    const view = new ScrollImageView(options);
    view.init();
    const image = view.view!.querySelector('img')!;
    return { view, image };
  }

  /** the image is loaded, with its natural size */
  function load(image: HTMLImageElement, width: number, height: number): void {
    Object.defineProperty(image, 'naturalWidth', { value: width, configurable: true });
    Object.defineProperty(image, 'naturalHeight', { value: height, configurable: true });
    image.dispatchEvent(new Event('load'));
  }

  it('should load its image, then emit load', function () {
    const { view, image } = makeImage({ src: 'photo.png' });
    assert.match(image.src, /photo\.png$/);
    assert.strictEqual(view.isLoaded, false);
    let loads = 0;
    view.on('load', () => { loads++; });

    load(image, 100, 50);
    assert.strictEqual(view.isLoaded, true);
    assert.strictEqual(loads, 1);
  });

  it('should keep the src of its node', function () {
    const node = document.createElement('div');
    node.innerHTML = '<img class="content" src="images/existing.png">';
    const view = new ScrollImageView({ node });
    view.init();
    assert.strictEqual(view.src, 'images/existing.png');
  });

  it('should stretch the image', function () {
    const { view, image } = makeImage({ size: [200, 100] });
    assert.deepStrictEqual([image.style.width, image.style.height, image.style.objectFit], ['100%', '100%', 'fill']);

    view.stretch = ScrollImageView.STRETCH_UNIFORM;
    assert.deepStrictEqual([image.style.width, image.style.height, image.style.objectFit], ['100%', '100%', 'contain']);

    view.stretch = ScrollImageView.STRETCH_NONE;
    assert.deepStrictEqual([image.style.width, image.style.height, image.style.objectFit], ['', '', '']);

    view.stretch = 9;
    assert.strictEqual(view.stretch, ScrollImageView.STRETCH_NONE);
  });

  it('should cover the view with the image, its ratio kept', function () {
    const { view, image } = makeImage({ size: [200, 100], stretch: ScrollImageView.STRETCH_UNIFORM_FILL });
    load(image, 100, 100);
    // a view wider than the image: the image width fills the view
    assert.deepStrictEqual([image.style.width, image.style.height], ['100%', '']);

    load(image, 400, 100);
    assert.deepStrictEqual([image.style.width, image.style.height], ['', '100%']);

    // a view taller than the image: the image width fills the view
    load(image, 50, 400);
    view.size = [100, 400];
    assert.deepStrictEqual([image.style.width, image.style.height], ['100%', '']);
  });

  it('should scroll the image in the view', function () {
    const { view, image } = makeImage({ scroll: ScrollView.SCROLL });
    assert.deepStrictEqual([view.view!.style.overflowX, view.view!.style.overflowY], ['auto', 'auto']);
    assert.strictEqual(view.view!.style.display, '');
    assert.strictEqual(image.style.overflowY, '');
  });

  it('should free its image when destroyed', function () {
    const { view, image } = makeImage({ src: 'photo.png' });
    let loads = 0;
    view.on('load', () => { loads++; });
    view.destroy();
    assert.match(image.src, /^data:image\/gif/);
    image.dispatchEvent(new Event('load'));
    assert.strictEqual(loads, 0);
  });
});
