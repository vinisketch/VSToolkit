import assert from 'assert';

import '../../dom';

import Template from '../../../src/ui/Template';

describe('Template', function () {
  describe('apply', function () {
    it('should replace the tags with the values', function () {
      const template = new Template('<span style="${style}">${last}, ${first}</span>');
      assert.strictEqual(
        template.apply({ style: 'color:blue', last: 'Doe', first: 'John' }),
        '<span style="color:blue">Doe, John</span>',
      );
    });

    it('should follow a path of keys', function () {
      const template = new Template('${name.last} ${name.first}');
      assert.strictEqual(template.apply({ name: { last: 'Doe', first: 'John' } }), 'Doe John');
    });

    it('should replace a missing value with an empty string', function () {
      const template = new Template('[${a}][${b.c}]');
      assert.strictEqual(template.apply({ b: {} }), '[][]');
    });

    it('should return the template without values', function () {
      const template = new Template('<p>${a}</p>');
      assert.strictEqual(template.apply(), '<p>${a}</p>');
      assert.strictEqual(String(template), '<p>${a}</p>');
    });
  });

  describe('parseHTML', function () {
    it('should return the first element, detached', function () {
      const node = Template.parseHTML('  <div class="box"><p>text</p></div>  ');
      assert.ok(node instanceof HTMLElement);
      assert.strictEqual(node!.className, 'box');
      assert.strictEqual(node!.parentElement, null);
      assert.strictEqual(node!.querySelector('p')!.textContent, 'text');
    });

    it('should return undefined without element', function () {
      assert.strictEqual(Template.parseHTML('only text'), undefined);
      assert.strictEqual(Template.parseHTML(''), undefined);
    });
  });

  describe('node', function () {
    it('should create a new node at each call', function () {
      const template = new Template('<div><p x-hag-hole="children"></p></div>');
      const first = template.node()!;
      const second = template.node()!;
      assert.notStrictEqual(first, second);
      assert.ok(first.querySelector('[x-hag-hole="children"]'));
    });
  });
});
