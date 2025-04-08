module.exports = {
  extends: require.resolve('@umijs/max/stylelint'),
  rules: {
    'value-no-vendor-prefix': null,
    'selector-class-pattern': null,
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: [
          'tailwind',
          'apply',
          'variants',
          'responsive',
          'screen',
          'layer',
        ],
      },
    ],
    'declaration-block-trailing-semicolon': null,
    'no-descending-specificity': null,
    'function-no-unknown': null,
    'no-empty-source': null,
  },
};
