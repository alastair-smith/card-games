import {
  Controls,
  Description,
  DocsContext,
  Heading,
  Subtitle,
  Title,
} from '@storybook/addon-docs/blocks';
import { useContext } from 'react';
import { StoryAtBothSizes } from '../story-at-both-sizes';

// Mirrors Storybook's default autodocs page, with every story shown at both
// mobile and desktop sizes
export const DocsPage = () => {
  const { componentStories } = useContext(DocsContext);
  const stories = componentStories().filter(
    (story) => story.tags.includes('autodocs') && !story.usesMount,
  );
  const [primaryStory] = stories;
  const isSingleStory = stories.length === 1;

  return (
    <>
      <Title />
      <Subtitle />
      <Description of='meta' />
      {isSingleStory && <Description of='story' />}
      {primaryStory && <StoryAtBothSizes story={primaryStory} isPrimary />}
      <Controls />
      {!isSingleStory && (
        <>
          <Heading>Stories</Heading>
          {stories.map((story) => (
            <StoryAtBothSizes key={story.id} story={story} />
          ))}
        </>
      )}
    </>
  );
};
