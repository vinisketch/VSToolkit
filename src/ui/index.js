/** @license
  Copyright (C) 2009-2018. David Thevenin, ViniSketch SARL (c), and 
  contributors. All rights reserved
  
  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU Lesser General Public License as published
  by the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.
  
  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
  GNU Lesser General Public License for more details.
  
  You should have received a copy of the GNU Lesser General Public License
  along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

import vs_utils from 'vs_utils';

/********************************************************************
                   
*********************************************************************/
import Application from './Application/Application';
import Button from './Button/Button';
import Canvas from './Canvas/Canvas';
import CheckBox from './CheckBox/CheckBox';
import ComboBox from './ComboBox/ComboBox';
import ImageView from './ImageView/ImageView';
import InputField from './InputField/InputField';
import {
  List,
  AbstractListItem,
  DefaultListItem,
  SimpleListItem
} from './List/List';
import AbstractList from './List/AbstractList';
import NavigationBar from './NavigationBar/NavigationBar';
import Picker from './Picker/Picker';
import PopOver from './PopOver/PopOver';
import ProgressBar from './ProgressBar/ProgressBar';
import RadioButton from './RadioButton/RadioButton';
import DragRecognizer from './Recognizers/DragRecognizer';
import PinchRecognizer from './Recognizers/PinchRecognizer';
import RotationRecognizer from './Recognizers/RotationRecognizer';
import TapRecognizer from './Recognizers/TapRecognizer';
import ScrollImageView from './ScrollImageView/ScrollImageView';
import ScrollView from './ScrollView/ScrollView';
import SegmentedButton from './SegmentedButton/SegmentedButton';
import Slider from './Slider/Slider';
import SplitView from './SplitView/SplitView';
import SVGView from './SVGView/SVGView';
import Switch from './Switch/Switch';
import TextArea from './TextArea/TextArea';
import TextLabel from './TextLabel/TextLabel';
import ToolBar from './ToolBar/ToolBar';
import View from './View/View';
import Template from './Template';

function preventBehavior(e) {
  //  window.scrollTo (0, 0);

  if (e.type == "touchstart" &&
    (e.target.tagName == "INPUT" ||
      e.target.tagName == "input" ||
      e.target.tagName == "TEXTAREA" ||
      e.target.tagName == "textarea")) {
    // on android do not cancel event otherwise the keyboard does not appear
    return;
  }

  e.preventDefault();
  return false;
};

vs_utils.defineProperty(document, 'preventScroll', {
  get: function () {
    return document._preventScroll;
  },

  set: function (preventScroll) {
    document._preventScroll = preventScroll;
    if (preventScroll) {
      // for android
      document.addEventListener("touchstart", preventBehavior, false);
      // for android and other
      document.addEventListener("touchmove", preventBehavior, false);
      document.addEventListener("scroll", preventBehavior, false);
      window.scrollTo(0, 0);
    }
    else {
      // for android
      document.removeEventListener("touchstart", preventBehavior, false);
      // for android and other
      document.removeEventListener("touchmove", preventBehavior, false);
      document.removeEventListener("scroll", preventBehavior, false);
    }
  }
});

export {
  Application,
  Button,
  Canvas,
  CheckBox,
  ComboBox,
  ImageView,
  InputField,
  AbstractList,
  List,
  AbstractListItem,
  DefaultListItem,
  SimpleListItem,
  NavigationBar,
  Picker,
  PopOver,
  ProgressBar,
  RadioButton,
  DragRecognizer,
  PinchRecognizer,
  RotationRecognizer,
  TapRecognizer,
  ScrollImageView,
  ScrollView,
  SegmentedButton,
  Slider,
  SplitView,
  SVGView,
  Switch,
  TextArea,
  TextLabel,
  ToolBar,
  View,
  Template
}