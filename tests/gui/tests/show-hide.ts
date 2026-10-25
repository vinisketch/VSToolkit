import { View } from '../../../src/ui';
import type { GuiTest } from './gui-test';

function box(position: number[], color: string): View {
  const view = new View({ position, size: [100, 100], layout: View.ABSOLUTE_LAYOUT });
  view.init();
  view.setStyle('background-color', color);
  return view;
}

export default {
  name: 'show_hide',
  description: 'red hides then shows at once; blue slides out slowly then back; ' +
    'green slides out half transparent, comes back rotated, then slides out and stays visible',
  image: 'show_hide.png',
  run(container) {
    const root = new View({ position: [0, 0], size: [400, 500], layout: View.ABSOLUTE_LAYOUT });
    root.init();
    container.appendChild(root.view!);

    const red = box([20, 10], 'red');
    const blue = box([20, 130], 'blue');
    const green = box([20, 250], 'green');
    root.add(red);
    root.add(blue);
    root.add(green);

    blue.setHideAnimation([['translate', '500px,0,0'], ['opacity', '0']], { duration: '30s' });
    blue.setShowAnimation([['translate', '0,0,0'], ['opacity', '1']]);

    green.setHideAnimation([['translate', '200px,0,0'], ['opacity', '0.5']], { duration: '6s' }, () => {
      // stays visible once hidden
      green.view?.style.removeProperty('display');
    });
    green.setShowAnimation([['translate', '0,0,0'], ['rotate', '-90deg'], ['opacity', '1']], { duration: '4s' });

    const steps: [number, () => void][] = [
      [500, () => red.hide()],
      [1500, () => red.show()],
      [800, () => blue.hide()],
      [4000, () => blue.show()],
      [800, () => green.hide()],
      [4000, () => green.show()],
      [6000, () => green.hide()],
    ];
    const timers = steps.map(([delay, step]) => setTimeout(step, delay));

    return () => {
      timers.forEach(timer => clearTimeout(timer));
      root.destroy();
    };
  },
} satisfies GuiTest;
