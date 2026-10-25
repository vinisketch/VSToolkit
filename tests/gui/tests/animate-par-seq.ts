import { task } from 'vs_toolkit/vs_core';
import { RotateXYZAnimation, TextLabel } from '../../../src/ui';
import type { GuiTest } from './gui-test';

function item(id: string, text: string, position: number[], size: number[], color: string): TextLabel {
  const label = new TextLabel({ id, text, position, size });
  label.init();
  label.setStyles({ backgroundColor: color, color: 'white', textAlign: 'center', transformOrigin: '50% 50%' });
  return label;
}

export default {
  name: 'animate_par_seq',
  description: 'the red item rotates in 3D, then the blue one rotates, then both rotate back',
  image: 'animate_par_seq.jpg',
  run(container) {
    const item1 = item('gui_item1', '1', [50, 50], [200, 200], 'red');
    const item2 = item('gui_item2', '2', [50, 300], [40, 100], 'blue');
    item2.setStyle('min-width', '40px');
    container.append(item1.view!, item2.view!);

    const options = { duration: '2s', additive: true };
    const rotate1 = new RotateXYZAnimation(30, 50, 100, options);
    const rotate2 = new RotateXYZAnimation(0, 0, -100, options);
    const rotate3 = new RotateXYZAnimation(0, 0, 0, options);

    const group1 = task.par([[rotate1, item1]]);
    const group2 = task.seq([group1, [rotate2, item2]]);
    // a task runs once at a time: a clone for the second item
    const group3 = task.seq([group2, task.par([[rotate3, item1], [rotate3.clone(), item2]])]);
    group3.start();

    return () => {
      group3.stop();
      item1.destroy();
      item2.destroy();
    };
  },
} satisfies GuiTest;
