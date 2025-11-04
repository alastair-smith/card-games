import type NextImage from 'next/image';
import { getImageProps } from 'next/image';
import type { ComponentProps } from 'react';
import { cn } from '~/utils/cn';

/**
 * Wrapper around the NextJS `<Image />` element.
 *
 * Strips out `style={{ color: transparent }}` as this violates the CSP header.
 *
 * See https://github.com/vercel/next.js/issues/45184#issuecomment-1988319088.
 */
export default function Image(props: ComponentProps<typeof NextImage>) {
  const { props: nextProps } = getImageProps({
    ...props,
  });

  const { style: _omit, alt, className, ...delegated } = nextProps;
  return (
    // biome-ignore lint/performance/noImgElement: required for image CSP workaround without inline style
    <img
      alt={alt}
      className={cn('text-transparent', className)}
      {...delegated}
    />
  );
}
