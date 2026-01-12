export { default as BlockVisibilityMenuItem } from './menu-item';
export { default as BlockVisibilityToolbar } from './toolbar';
export { useBlockVisibility } from './use-block-visibility';

import BlockVisibilityInfoDefault from './block-visibility-info';
import ViewportVisibilityInfo from './viewport-visibility-info';

const hasViewportVisibilityExperiment =
	typeof window !== 'undefined' &&
	window.__experimentalHideBlocksBasedOnScreenSize;

export const BlockVisibilityInfo = hasViewportVisibilityExperiment
	? ViewportVisibilityInfo
	: BlockVisibilityInfoDefault;
