// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  docs: [
    'intro',
    {
      type: 'category',
      label: 'Rules',
      items: [
        'rules/rule', //
        'rules/layer',
        'rules/simlayer',
      ],
    },
    {
      type: 'category',
      label: 'Manipulators',
      items: [
        'manipulators/from',
        'manipulators/double-tap',
        'manipulators/to',
        'manipulators/condition',
        'manipulators/mouse_motion_to_scroll',
      ],
    },
    'utils',
  ],
}

module.exports = sidebars