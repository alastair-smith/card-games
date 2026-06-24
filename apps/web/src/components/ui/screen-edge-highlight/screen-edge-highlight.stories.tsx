import { ScreenEdgeHighlight } from '.';

export default {
  title: 'Components / Screen Edge Highlight',
};

export const Default = () => (
  <div className='bg-main-background text-dark-text flex min-h-screen items-center justify-center'>
    <p className='text-lg'>The screen edges are highlighted.</p>
    <ScreenEdgeHighlight />
  </div>
);
