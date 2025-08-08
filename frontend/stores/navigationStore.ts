interface NavigationState {
  selectedItem: number;
  isMobile: boolean;
  viewMode: 'client' | 'swapper';
}

const createInitialNavigationState = (): NavigationState => {
  return {
    selectedItem: 0,
    isMobile: typeof window !== 'undefined' ? window.innerWidth <= 768 : true,
    viewMode: 'client',
  };
};

/**
 * Represents the navigation store.
 */
export const useNavigationStore = defineStore('navigationStore', {
  state: (): { navigation: NavigationState } => ({
    navigation: createInitialNavigationState(),
  }),
  getters: {
    /**
     * Gets the selected navigation item index.
     * @returns The selected navigation item index.
     */
    getSelectedItem(): number {
      return this.navigation.selectedItem;
    },
    /**
     * Gets the isMobile property.
     * @returns The isMobile property.
     */
    getIsMobile(): boolean {
      return this.navigation.isMobile;
    },
    /**
     * Gets the current view mode (client or swapper).
     * @returns The current view mode.
     */
    getViewMode(): 'client' | 'swapper' {
      return this.navigation.viewMode;
    },
    /**
     * Checks if the current view mode is swapper.
     * @returns True if the current view mode is swapper, false otherwise.
     */
    isSwapperMode(): boolean {
      return this.navigation.viewMode === 'swapper';
    },
  },
  actions: {
    /**
     * Sets the selected navigation item index.
     * @param index - The index of the selected item to be set.
     */
    setSelectedItem(index: number) {
      this.navigation.selectedItem = index;
      if (typeof window !== 'undefined') {
        localStorage.setItem('currentTab', index.toString());
      }
    },
    /**
     * Sets the mobile state based on the window width.
     */
    updateScreenSize() {
      if (typeof window !== 'undefined') {
        this.navigation.isMobile = window.innerWidth <= 768;
      }
    },
    /**
     * Initializes the selected item from localStorage.
     */
    initializeSelectedItem() {
      if (typeof window !== 'undefined') {
        const storedSelectedItem = localStorage.getItem('currentTab');
        if (storedSelectedItem !== null) {
          this.navigation.selectedItem = parseInt(storedSelectedItem);
        } else {
          this.navigation.selectedItem = 0;
        }
      }
    },
    /**
     * Toggles the view mode between client and swapper.
     */
    toggleViewMode() {
      this.navigation.viewMode = this.navigation.viewMode === 'client' ? 'swapper' : 'client';
      if (typeof window !== 'undefined') {
        localStorage.setItem('viewMode', this.navigation.viewMode);
      }
    },
    /**
     * Sets the view mode.
     * @param mode - The view mode to be set.
     */
    setViewMode(mode: 'client' | 'swapper') {
      this.navigation.viewMode = mode;
      if (typeof window !== 'undefined') {
        localStorage.setItem('viewMode', mode);
      }
    },
    /**
     * Initializes the view mode from localStorage.
     */
    initializeViewMode() {
      if (typeof window !== 'undefined') {
        const storedViewMode = localStorage.getItem('viewMode') as 'client' | 'swapper' | null;
        if (storedViewMode && (storedViewMode === 'client' || storedViewMode === 'swapper')) {
          this.navigation.viewMode = storedViewMode;
        } else {
          this.navigation.viewMode = 'client';
        }
      }
    },
  },
});
