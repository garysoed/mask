import { createImmutableMap } from 'gs-tools/export/collect';
import { Jsons } from 'gs-tools/export/data';
import { icon, Palette, start as startMask } from '../export';
import { $theme, _v } from '../src/app/app';
import { textIconButton, TextIconButton } from '../src/component/text-icon-button';
import { breadcrumb, Breadcrumb } from '../src/display/breadcrumb';
import { croppedLine, CroppedLine } from '../src/display/cropped-line';
import { Icon } from '../src/display/icon';
import { iconWithText, IconWithText } from '../src/display/icon-with-text';
import { textInput, TextInput } from '../src/input/text-input';
import { backdrop } from '../src/section/backdrop';
import { dialog, Dialog } from '../src/section/dialog';
import { $dialogService } from '../src/section/dialog-service';
import { drawer, Drawer } from '../src/section/drawer';
import { Theme } from '../src/theme/theme';
import { demoCtrl, DemoCtrl } from './demo-ctrl';

const theme = new Theme(Palette.ORANGE, Palette.GREEN);

const registeredFonts = createImmutableMap([
      ['palette', {type: 'remote' as 'remote', url: './asset/palette.svg'}],
      ['highlight', {type: 'remote' as 'remote', url: './asset/highlight.svg'}],
    ]);

const iconConfig = icon(registeredFonts);
const iconWithTextConfig = iconWithText(iconConfig);
const textIconButtonConfig = textIconButton(iconWithTextConfig);

window.addEventListener('load', () => {
  const {vine: maskVine} = startMask(
      [
        Breadcrumb,
        CroppedLine,
        DemoCtrl,
        Dialog,
        Drawer,
        Icon,
        IconWithText,
        TextIconButton,
        TextInput,
      ],
      [
        breadcrumb(),
        croppedLine(),
        demoCtrl(),
        dialog(backdrop(), textIconButtonConfig),
        drawer(),
        iconConfig,
        iconWithTextConfig,
        textIconButtonConfig,
        textInput(),
      ],
      theme,
      document.getElementById('globalStyle') as HTMLStyleElement);

  maskVine.getObservable($theme).subscribe(theme => maskVine.setValue($theme, theme));
  maskVine.getObservable($dialogService).subscribe(service => {
    Jsons.setValue(window, 'demo.dialogService', service);
  });
});
