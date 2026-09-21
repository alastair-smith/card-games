import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { HowToSection } from './how-to';

const meta = {
  title: 'High Card / How To',
  component: HowToSection,
} satisfies Meta<typeof HowToSection>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Section: Story = {};
