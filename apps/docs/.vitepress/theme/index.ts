import mediumZoom from 'medium-zoom';
import { useRoute } from 'vitepress';
import DefaultTheme from 'vitepress/theme-without-fonts';
import { nextTick, onMounted, watch } from 'vue';
import './storybook-colors.css';

function useDiagramZoom() {
  const route = useRoute();

  onMounted(() => {
    const zoom = mediumZoom({ background: 'var(--vp-c-bg)', margin: 24 });
    const attachDiagrams = () => {
      zoom.detach();
      zoom.attach('.diagram-light', '.diagram-dark');
    };

    attachDiagrams();
    watch(
      () => route.path,
      () => nextTick(attachDiagrams),
    );
  });
}

export default {
  extends: DefaultTheme,
  setup: useDiagramZoom,
};
