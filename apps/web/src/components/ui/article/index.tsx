import { LinkIcon } from 'lucide-react';
import * as React from 'react';
import { cn } from '~/utils/cn';

type HeadingEntry = { id: string; text: string };

function extractHeadings(children: React.ReactNode): HeadingEntry[] {
  const headings: HeadingEntry[] = [];
  function traverse(node: React.ReactNode) {
    React.Children.forEach(node, (child) => {
      if (!React.isValidElement(child)) return;
      if (child.type === ArticleHeading) {
        const { id, children: text } = child.props as {
          id: string;
          children?: React.ReactNode;
        };
        headings.push({ id, text: typeof text === 'string' ? text : id });
      }
      traverse((child.props as { children?: React.ReactNode }).children);
    });
  }
  traverse(children);
  return headings;
}

const linkClassName =
  'cursor-pointer underline ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring focus-visible:ring-offset-2 rounded';

function injectHeadings(
  children: React.ReactNode,
  headings: HeadingEntry[],
): React.ReactNode {
  return React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) return child;
    if (child.type === ArticleContents) {
      return React.cloneElement(
        child as React.ReactElement<{ headings: HeadingEntry[] }>,
        { headings },
      );
    }
    const nested = (child.props as { children?: React.ReactNode }).children;
    if (nested) {
      return React.cloneElement(
        child as React.ReactElement<{ children: React.ReactNode }>,
        {
          children: injectHeadings(nested, headings),
        },
      );
    }
    return child;
  });
}

function Article({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const headings = extractHeadings(children);

  return (
    <div
      className={cn(
        'bg-card-background text-light-text rounded-lg py-10 sm:px-5 w-full max-w-5xl',
        className,
      )}
      {...props}
    >
      {injectHeadings(children, headings)}
    </div>
  );
}

const ArticleHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-4', className)}
    {...props}
  />
));
ArticleHeader.displayName = 'ArticleHeader';

const ArticleContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('p-4 pt-0 flex flex-col gap-3', className)}
    {...props}
  />
));
ArticleContent.displayName = 'ArticleContent';

const ArticleTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn(
      'text-2xl font-semibold leading-none tracking-tight',
      className,
    )}
    {...props}
  />
));
ArticleTitle.displayName = 'ArticleTitle';

const ArticleSubtitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-light-text-disabled text-sm', className)}
    {...props}
  />
));
ArticleSubtitle.displayName = 'ArticleSubtitle';

interface ArticleContentsProps extends React.HTMLAttributes<HTMLElement> {
  headings?: HeadingEntry[];
}

const ArticleContents = React.forwardRef<HTMLElement, ArticleContentsProps>(
  ({ className, headings, ...props }, ref) => {
    if (!headings || headings.length === 0) return null;
    return (
      <nav
        ref={ref}
        aria-label='Contents'
        className={cn('flex flex-col', className)}
        {...props}
      >
        <p className='font-semibold text-base mt-6 mb-2'>Contents</p>
        <ol className='text-sm list-decimal pl-5 space-y-1'>
          {headings.map(({ id, text }) => (
            <li key={id}>
              <a href={`#${id}`} className={linkClassName}>
                {text}
              </a>
            </li>
          ))}
        </ol>
      </nav>
    );
  },
);
ArticleContents.displayName = 'ArticleContents';

interface ArticleHeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  id: string;
}

const ArticleHeading = React.forwardRef<
  HTMLHeadingElement,
  ArticleHeadingProps
>(({ id, className, children, ...props }, ref) => (
  <h3
    ref={ref}
    id={id}
    className={cn(
      'group relative font-semibold text-base mt-6 mb-2',
      className,
    )}
    {...props}
  >
    <a
      href={`#${id}`}
      aria-label='Link to this section'
      className='absolute right-full pr-1.5 opacity-0 group-hover:opacity-100 transition-opacity text-light-text-disabled hover:text-light-text'
    >
      <LinkIcon size={14} />
    </a>
    <a href={`#${id}`} className='text-inherit no-underline hover:no-underline'>
      {children}
    </a>
  </h3>
));
ArticleHeading.displayName = 'ArticleHeading';

export {
  Article,
  ArticleContent,
  ArticleContents,
  ArticleHeader,
  ArticleHeading,
  ArticleSubtitle,
  ArticleTitle,
};
