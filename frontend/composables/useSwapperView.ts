import { computed } from 'vue';
import { useUserStore } from '~/stores/userStore';
import { useNavigationStore } from '~/stores/navigationStore';

/**
 * Composable to handle swapper view mode logic
 * 
 * Provides computed properties to determine if swapper views should be shown
 * based on user's swapper status and current navigation mode.
 */
export function useSwapperView() {
  const userStore = useUserStore();
  const navigationStore = useNavigationStore();

  /**
   * Whether the user is a swapper
   */
  const isSwapper = computed(() => {
    // Safe access to user properties, with fallback for SSR
    return userStore?.user?.isSwapper ?? false;
  });
  
  /**
   * Whether the current view mode is set to swapper
   */
  const isSwapperMode = computed(() => {
    // Safe access to navigation state, with fallback for SSR
    return navigationStore?.navigation?.viewMode === 'swapper';
  });
  
  /**
   * Whether to show swapper-specific UI elements
   * (user must be a swapper AND view mode must be set to swapper)
   */
  const showSwapperView = computed(() => isSwapper.value && isSwapperMode.value);
  
  /**
   * Toggle between client and swapper view modes
   */
  const toggleViewMode = () => {
    if (process.client) {
      navigationStore.toggleViewMode();
    }
  };
  
  /**
   * Set a specific view mode (client or swapper)
   */
  const setViewMode = (mode: 'client' | 'swapper') => {
    if (process.client) {
      navigationStore.setViewMode(mode);
    }
  };
  
  return {
    isSwapper,
    isSwapperMode,
    showSwapperView,
    toggleViewMode,
    setViewMode
  };
} 