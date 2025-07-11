/* eslint-disable storybook/no-renderer-packages */
import type { Meta, StoryObj } from '@storybook/react';
import Button from './Button';

const meta: Meta<typeof Button> = {
  title: 'Design System/Button',
  component: Button,
  args: {
    label: 'Click me',
  },
};

export default meta;

export const Primary: StoryObj<typeof Button> = {
  args: {
    label: 'Primary',
  },
}; 