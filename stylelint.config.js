/** Tailwind CSS uses custom at-rules like `@tailwind` and `@apply`.
 *  This config tells stylelint not to treat them as unknown.
 */
module.exports = {
  rules: {
    "at-rule-no-unknown": [
      true,
      {
        ignoreAtRules: ["tailwind", "apply"]
      }
    ]
  }
};


