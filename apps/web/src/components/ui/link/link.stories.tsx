import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Link } from '.';

const meta = {
  title: 'UI Components /Link',
  component: Link,
  args: {
    children: 'Example link',
    href: 'https://example.com',
  },
} satisfies Meta<typeof Link>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Inline: Story = {
  args: {
    children: 'contact@playcards.games',
    href: 'mailto:contact@playcards.games',
  },
  render: (args) => (
    <p>
      For questions contact <Link {...args} />.
    </p>
  ),
};

export const Standalone: Story = {
  args: { target: '_blank', rel: 'noopener noreferrer' },
};
