import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    {
      type: 'category',
      label: 'README',
      collapsed: false,
      items: [{
        type: 'doc',
        id: 'README',
        label: '1.1. Introduction',

      }],
    },
    {
      type: 'category',
      label: 'BASICS',
      collapsed: false,
      items: [
        {
          type: 'doc',
          id: 'docs/basics/Epics',
          label: '2.1. Epics',
        },
        {
          type: 'doc',
          id: 'docs/basics/SettingUpTheMiddleware',
          label: '2.2. Setting Up The Middleware',
        },
      ],
    },
    {
      type: 'category',
      label: 'RECIPES',
      collapsed: false,
      items: [
        {
          type: 'doc',
          id: 'docs/recipes/Cancellation',
          label: '3.1. Cancellation',
        },
        {
          type: 'doc',
          id: 'docs/recipes/ErrorHandling',
          label: '3.2. Error Handling',
        },
        {
          type: 'doc',
          id: 'docs/recipes/InjectingDependenciesIntoEpics',
          label: '3.3. Injecting Dependencies Into Epics',
        },
        {
          type: 'doc',
          id: 'docs/recipes/WritingTests',
          label: '3.4. Writing Tests',
        },
        {
          type: 'doc',
          id: 'docs/recipes/UsageWithUIFrameworks',
          label: '3.5. Usage With UI Frameworks',
        },
        {
          type: 'doc',
          id: 'docs/recipes/AddingNewEpicsAsynchronously',
          label: '3.6. Adding New Epics Asynchronously',
        },
        {
          type: 'doc',
          id: 'docs/recipes/HotModuleReplacement',
          label: '3.7. Hot Module Replacement',
        },
      ],
    },
    {
      type: 'category',
      label: 'HELP',
      collapsed: false,
      items: [
        {
          type: 'doc',
          id: 'docs/Troubleshooting',
          label: '4.1. Troubleshooting',
        },
      ],
    },
    {
      type: 'category',
      label: 'API REFERENCE',
      collapsed: false,
      items: [
        {
          type: 'doc',
          id: 'docs/api/createEpicMiddleware',
          label: '5.1. createEpicMiddleware',
        },
        {
          type: 'doc',
          id: 'docs/api/combineEpics',
          label: '5.2. combineEpics',
        },
        {
          type: 'doc',
          id: 'docs/api/EpicMiddleware',
          label: '5.3. EpicMiddleware',
        },
      ],
    },
    { type: 'doc', id: 'MIGRATION', label: '6.1. MIGRATION' },
    { type: 'doc', id: 'CODE_OF_CONDUCT', label: '6.2. CODE OF CONDUCT' },
    { type: 'doc', id: 'CHANGELOG', label: '6.3. CHANGELOG' },

  ],
};

export default sidebars;
