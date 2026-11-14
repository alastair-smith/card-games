import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { stubBrowserApis } from '~/test-utils/browser';
import { CelebrationRain } from './celebration-rain';

describe('CelebrationRain', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test('rains emoji while active', () => {
    stubBrowserApis({
      matchingQueries: ['(prefers-reduced-motion: no-preference)'],
    });
    render(
      <CelebrationRain emoji='🏆' isActive>
        <p>Content</p>
      </CelebrationRain>,
    );
    expect(screen.getAllByText('🏆').length).toBeGreaterThan(0);
  });

  test('rains nothing while inactive', () => {
    stubBrowserApis({
      matchingQueries: ['(prefers-reduced-motion: no-preference)'],
    });
    render(
      <CelebrationRain emoji='🏆' isActive={false}>
        <p>Content</p>
      </CelebrationRain>,
    );
    expect(screen.queryByText('🏆')).not.toBeInTheDocument();
  });

  test('rains nothing when the player has asked for reduced motion', () => {
    stubBrowserApis();
    render(
      <CelebrationRain emoji='🏆' isActive>
        <p>Content</p>
      </CelebrationRain>,
    );
    expect(screen.queryByText('🏆')).not.toBeInTheDocument();
  });
});
