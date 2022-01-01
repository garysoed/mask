set_vars({
  vars: {
    goldens: [
      'src/action/goldens',
      'src/core/goldens',
      'src/display/goldens',
      'src/input/goldens',
      'src/layout/goldens',
      'src/theme/goldens',
      'src/util/goldens',
    ],
  },
});


declare({
  name: 'link',
  as: shell({
    bin: 'npm',
    flags: [
      'link',
      'gs-tools',
      'gs-testing',
      'gs-types',
      'grapevine',
      'dev',
      'persona',
      'moirai',
      'nabu',
      'santa',
      'devbase',
    ],
  }),
});

declare({
  name: 'demo',
  as: parallel(({vars}) => ({
    cmds: [
      vars.webpackWatch,
      shell({
        bin: 'simpleserver',
        flags: [
          'demo/static.conf.json',
        ],
      }),
    ],
  })),
});

