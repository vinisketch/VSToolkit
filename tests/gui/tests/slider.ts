import { Slider, TextLabel } from '../../../src/ui';
import type { GuiTest } from './gui-test';

export default {
  name: 'slider',
  description: 'a horizontal slider in [0, 100] and a vertical one in [50, 60]; the labels follow the values',
  image: 'slider.jpg',
  run(container) {
    const horizontal = new Slider({ position: [50, 50], size: [300, 10], value: 64 });
    horizontal.init();
    const label1 = new TextLabel({ position: [50, 10], text: '64' });
    label1.init();

    const vertical = new Slider({
      position: [50, 100], size: [10, 100], value: 56, orientation: Slider.VERTICAL, range: [50, 60],
    });
    vertical.init();
    const label2 = new TextLabel({ position: [100, 100], text: '56' });
    label2.init();

    for (const view of [horizontal, label1, vertical, label2]) container.appendChild(view.view!);
    // the handles, once laid out
    horizontal.refresh();
    vertical.refresh();

    horizontal.on('input', (_slider, value) => { label1.text = String(Math.floor(value)); });
    vertical.on('input', (_slider, value) => { label2.text = String(Math.floor(value)); });

    return () => [horizontal, label1, vertical, label2].forEach(view => view.destroy());
  },
} satisfies GuiTest;
