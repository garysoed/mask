import * as fs from 'fs';

import commandLineArgs from 'command-line-args';
import {Color, fromCssColor} from 'gs-tools/export/color';
import {enumType} from 'gs-types';
import {EMPTY, Observable, Subject} from 'rxjs';
import {catchError, takeUntil} from 'rxjs/operators';
import {Logger, ON_LOG_$} from 'santa';
import {CliDestination} from 'santa/export/cli';

import {ThemeMode} from '../theme/const';
import {Theme} from '../theme/theme';
import {ThemeSeed, THEME_SEEDS} from '../theme/theme-seed';


const LOGGER = new Logger('@hive/main');

const OPTIONS = [
  {
    name: 'base',
    type: String,
  },
  {
    name: 'acc',
    type: String,
  },
  {
    name: 'mode',
    type: String,
  },
  {
    name: 'out',
    type: String,
  },
];

const options = commandLineArgs(OPTIONS, {stopAtFirstUnknown: true});

/**
 * Completes whenever running is done.
 */
function run(): Observable<unknown> {
  const base = findColor(options.base);
  const acc = findColor(options.acc);
  const outStr = options.out;
  const mode = options.mode;
  if (!enumType<ThemeMode>(ThemeMode).check(mode)) {
    throw new Error(`Unsupported mode: ${mode}`);
  }
  const theme = new Theme({baseSeed: base, accentSeed: acc, mode});

  return new Observable(subscriber => {
    fs.writeFile(outStr, theme.generateCss(), {encoding: 'utf8'}, err => {
      if (err) {
        subscriber.error(err);
      } else {
        subscriber.next();
        subscriber.complete();
      }
    });
  });
}

function findColor(colorStr: string): Color {
  const existingColor: Color|undefined = THEME_SEEDS[colorStr.toUpperCase() as keyof ThemeSeed];
  if (existingColor) {
    return existingColor;
  }

  const cssColor = fromCssColor(colorStr);
  if (!cssColor) {
    throw new Error(`Unsupported color: ${colorStr}`);
  }

  return cssColor;
}

const onDone$ = new Subject();
const consoleLog = new CliDestination(
    entry => {
      if (entry.key === 'authurl') {
        return {showKey: false, enableFormat: false};
      }
      return {showKey: false};
    },
);
ON_LOG_$
    .pipe(takeUntil(onDone$))
    .subscribe(entry => {
      consoleLog.log(entry);
    });

run()
    .pipe(
        catchError(e => {
          LOGGER.error(e);
          return EMPTY;
        }),
    )
    .subscribe({complete: () => {
      onDone$.next();
    }});
