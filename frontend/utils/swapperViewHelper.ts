/**
 * Helper functions for swapper view mode logic
 * This provides utility functions for components that don't want to use the full composable
 */

/**
 * Checks if the swapper view should be shown
 * @returns True if the user is a swapper and view mode is set to swapper
 */
export function shouldShowSwapperView(): boolean {
  // Return false during SSR
  if (!process.client) return false;
  
  const userStore = useUserStore();
  const navigationStore = useNavigationStore();
  
  // User must be a swapper and view mode must be set to swapper
  return (userStore?.user?.isSwapper ?? false) && 
         (navigationStore?.navigation?.viewMode === 'swapper');
}

/**
 * Sets the swapper view mode
 * @param isSwapperMode Whether to set swapper mode (true) or client mode (false)
 */
export function setSwapperViewMode(isSwapperMode: boolean): void {
  // Skip during SSR
  if (!process.client) return;
  
  const navigationStore = useNavigationStore();
  navigationStore.setViewMode(isSwapperMode ? 'swapper' : 'client');
}

/**
 * Toggles between swapper and client view modes
 */
export function toggleSwapperViewMode(): void {
  // Skip during SSR
  if (!process.client) return;
  
  const navigationStore = useNavigationStore();
  navigationStore.toggleViewMode();
} 