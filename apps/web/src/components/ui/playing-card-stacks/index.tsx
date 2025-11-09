import {
  Children,
  type ComponentProps,
  cloneElement,
  Fragment,
  type FragmentProps,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from 'react';
import {
  PLAYING_CARD_DEFAULT_SIZE,
  PlayingCard,
} from '~/components/ui/playing-card';
import { cn } from '~/utils/cn';

type PlayingCardDeckProps = {
  className?: string;
  fontSize?: `text-${string}`;
};

export function PlayingCardDeck({
  className,
  fontSize = PLAYING_CARD_DEFAULT_SIZE,
}: PlayingCardDeckProps) {
  return (
    <div
      className={cn(
        'relative w-fit pt-[0.56em] pr-[0.44em]',
        fontSize,
        className,
      )}
    >
      <div className='w-fit relative'>
        <div className='w-[3.75em] h-[5.25em] absolute inset-0 translate-x-[0.32em] -translate-y-[0.44em] rounded-[0.22em] border-[0.056em] border-border/50 bg-white' />
        <div className='w-[3.75em] h-[5.25em] absolute inset-0 translate-x-[0.24em] -translate-y-[0.33em] rounded-[0.22em] border-[0.056em] border-border/50 bg-white' />
        <div className='w-[3.75em] h-[5.25em] absolute inset-0 translate-x-[0.16em] -translate-y-[0.22em] rounded-[0.22em] border-[0.056em] border-border/50 bg-white' />
        <div className='w-[3.75em] h-[5.25em] absolute inset-0 translate-x-[0.08em] -translate-y-[0.11em] rounded-[0.22em] border-[0.056em] border-border/50 bg-white' />
        <div className='w-[3.75em] h-[5.25em] relative'>
          <PlayingCard
            card={null}
            className={fontSize}
            cardClassName='border-[0.056em] border-border/50'
          />
        </div>
      </div>
    </div>
  );
}

type PlayingCardStack = {
  className?: string;
  children?:
    | ReactElement<typeof PlayingCard>
    | ReactElement<typeof PlayingCard>[];
};

function StackChildren({ children }: { children: ReactNode }) {
  return Children.map(children, (child) => {
    if (
      !isValidElement<ComponentProps<typeof PlayingCard>>(child) ||
      !isValidElement<FragmentProps>(child)
    )
      return child;

    if (child.type === Fragment) {
      return <StackChildren>{child.props.children}</StackChildren>;
    }

    const {
      className: childClassName,
      cardClassName,
      ...childProps
    } = child.props;

    return cloneElement(child, {
      className: cn('-ml-[1.44em] first:ml-0', childClassName),
      cardClassName: cn('border-[0.056em] border-border/50', cardClassName),
      ...childProps,
    });
  });
}

export function PlayingCardStack({ className, children }: PlayingCardStack) {
  return (
    <div className={cn('flex', className)}>
      <StackChildren>{children}</StackChildren>
    </div>
  );
}

type PlayingCardDiscardPile = {
  className?: string;
  children?:
    | ReactElement<typeof PlayingCard>
    | ReactElement<typeof PlayingCard>[]
    | null;
};

/**
 * Pass visible cards as children
 */
export function PlayingCardDiscardPile({
  className,
  children,
}: PlayingCardDiscardPile) {
  const childCount = Children.count(children);
  const displayCount = Math.min(childCount, 3);

  const widthInEm =
    displayCount > 0 ? 3.75 + (displayCount - 1) * (3.75 - 1.44) : 0;

  return (
    <div
      className={cn(
        'border-[0.056em] rounded-[0.22em] bg-white/20 border-white p-2 w-fit',
        PLAYING_CARD_DEFAULT_SIZE,
        className,
      )}
    >
      <div
        className={cn('relative h-[5.25em]')}
        style={{ width: `${widthInEm}em` }}
      >
        {Children.map(children, (child, index) => {
          if (!isValidElement<ComponentProps<typeof PlayingCard>>(child))
            return child;

          const {
            className: childClassName,
            cardClassName,
            ...childProps
          } = child.props;

          const isHidden = childCount > 3 && index >= 3;
          const displayIndex = isHidden ? displayCount - 1 : index;
          const xOffset = (displayCount - 1 - displayIndex) * (3.75 - 1.44);
          const zIndex = displayCount + 10 - index;

          return cloneElement(child, {
            className: cn(
              'absolute duration-1000 ease-in-out',
              'transition-transform',
              childClassName,
            ),
            style: {
              transform: `translateX(${xOffset}em)`,
              zIndex: zIndex,
              ...child.props.style,
            },
            cardClassName: cn(
              'border-[0.056em] border-border/50',
              cardClassName,
            ),
            ...childProps,
          });
        })}
      </div>
    </div>
  );
}
