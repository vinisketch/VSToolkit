import assert from 'assert';

import '../../dom';
import '../../di_config';

import { Component as PackageComponent } from 'vs_toolkit/vs_core';
import Component from '../../../src/core/Component';
import viewTemplate from '../../../src/ui/View/View.html';

describe('ui test environment', function () {
  it('should provide a DOM', function () {
    const div = document.createElement('div');
    div.classList.add('test');
    document.body.appendChild(div);
    assert.strictEqual(document.querySelector('.test'), div);
    div.remove();
  });

  it('should import the html templates as strings', function () {
    assert.strictEqual(typeof viewTemplate, 'string');
    assert.match(viewTemplate, /</);
  });

  it('should resolve vs_toolkit/vs_core to the core sources', function () {
    assert.strictEqual(PackageComponent, Component);
  });
});
