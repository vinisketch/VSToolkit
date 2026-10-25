/**
 * The ui library (vs_toolkit/vs_ui): the components converted to
 * TypeScript. The other components are added as they are converted.
 */
export { View, type ViewOptions, type ViewClass, type ViewChild } from './View/View';
export { default as Template } from './Template';
export * from './Animation';
export * from './Recognizers';
export { toText, type TextInputEvents } from './helpers';

export { TextLabel } from './TextLabel/TextLabel';
export { ImageView } from './ImageView/ImageView';
export { Button, type ButtonEvents } from './Button/Button';
export { ProgressBar } from './ProgressBar/ProgressBar';
export { TextArea } from './TextArea/TextArea';
export { InputField, type InputFieldType } from './InputField/InputField';
export { SVGView } from './SVGView/SVGView';
export { ComboBox, type ComboBoxEvents } from './ComboBox/ComboBox';
export { SegmentedButton, type SegmentedButtonEvents } from './SegmentedButton/SegmentedButton';
export { Canvas } from './Canvas/Canvas';
export { PopOver } from './PopOver/PopOver';
export { SplitView, type SplitViewDelegate } from './SplitView/SplitView';
