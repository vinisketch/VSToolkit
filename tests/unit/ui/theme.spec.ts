import assert from 'assert';

import '../../dom';

import { getDeviceCSSCode, CSS_DEFAULT, CSS_IOS7 } from '../../../src/ui';

describe('theme', function () {
  afterEach(function () {
    document.head.innerHTML = '';
    document.body.innerHTML = '';
  });

  it('should be the default theme without theme', function () {
    assert.strictEqual(getDeviceCSSCode(), CSS_DEFAULT);
  });

  it('should read the code of the theme', function () {
    const style = document.createElement('style');
    style.textContent = '.device_test { margin-top: 103px; }';
    document.head.appendChild(style);

    assert.strictEqual(getDeviceCSSCode(), CSS_IOS7);
    assert.strictEqual(document.querySelector('.device_test'), null, 'the test element is removed');
  });
});
