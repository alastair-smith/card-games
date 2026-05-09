import { Link } from '.';

export default {
  title: 'Components / Link',
};

export const Inline = () => (
  <p>
    For questions contact{' '}
    <Link href='mailto:contact@playcards.games'>contact@playcards.games</Link>.
  </p>
);

export const Standalone = () => (
  <Link href='https://example.com' target='_blank' rel='noopener noreferrer'>
    Example link
  </Link>
);
