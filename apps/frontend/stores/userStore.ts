import type { User } from '@/types/resource';
import notificationSocket from '~/sockets/notificationSocket';
import WebSocketService from '~/sockets/websocket.service';
import { banks, accountType } from '~/constants/banks';

const createInitialState = (): User => {
  return {
    id: 0,
    firstname: '',
    lastname: '',
    email: '',
    phonenumber: undefined,
    token: undefined,
    gender: undefined,
    birthdate: undefined,
    createdDate: undefined,
    updatedDate: undefined,
    rut: undefined,
    bank: undefined,
    accountType: undefined,
    accountNumber: undefined,
    isSwapper: false,
    isEmailConfirmed: false,
    profilePicturePath: ''
  };
}

/**
 * Represents the user store.
 */
export const useUserStore = defineStore('userStore', {
  state: (): {user: User} => ({
    user: createInitialState()
  }),
  getters: {
    /**
     * Gets the user object.
     * @returns The user object.
     */
    getUser(): User {
      return this.user;
    },
    /**
     * Gets the user's ID.
     * @returns The user's ID.
     */
    getId(): number {
      return this.user.id;
    },
    /**
     * Gets the user's first name.
     * @returns The user's first name.
     */
    getFirstname(): string {
      return this.user.firstname;
    },
    /**
     * Gets the user's last name.
     * @returns The user's last name.
     */
    getLastname(): string {
      return this.user.lastname;
    },
    /**
     * Gets the user's email.
     * @returns The user's email.
     */
    getEmail(): string {
      return this.user.email;
    },
    /**
     * Gets the user's phone number.
     * @returns The user's phone number.
     */
    getPhonenumber(): string | undefined {
      return this.user.phonenumber;
    },
    /**
     * Gets the last 8 digits of the user's phone number.
     * @returns The last 8 digits of the user's phone number, or undefined if not available.
     */
    getPhoneLastEightDigits(): string | undefined {
      if (this.user.phonenumber) {
        // Assuming the phone number starts with the country code, e.g., +569XXXXXXXX
        return this.user.phonenumber.slice(-8); // Return the last 8 digits
      }
      return undefined;
    },
    /**
     * Gets the user's token.
     * @returns The user's token.
     */
    getToken(): string | undefined {
      return this.user.token;
    },
    getRut(): string | undefined {
      return this.user.rut;
    },
    getBank(): string | undefined {
      return this.user.bank;
    },
    getAccountType(): string | undefined {
      return this.user.accountType;
    },
    getAccountNumber(): string | undefined {
      return this.user.accountNumber;
    },
    getIsEmailConfirmed(): boolean {
      return this.user.isEmailConfirmed || false;
    },
    getProfilePicturePath(): string | undefined {
      return this.user.profilePicturePath;
    }
  },
  actions: {
    setUserFromResponse(user: User, token: string) {
      this.user = user;
      this.user.token = token;
      if (typeof window !== 'undefined') {
        const localStorageData = {
          user: this.user,
          ttl: new Date(Date.now() + 86400 * 1000 * 7) // login lasts 1 week
        };
        localStorage.setItem("user", JSON.stringify(localStorageData));
        
        // Connect to notification WebSocket with token
        notificationSocket.connect(this.user.id, token).then(connected => {
          if (connected) {
            console.log('Notification socket connected for user:', this.user.email);
            // WebSocket is now connected, ready for chat functionality
          } else {
            console.error('Failed to connect notification socket for user:', this.user.email);
          }
        });
      }
    },
    setUserFromLocalStorage() {
      if (typeof window !== 'undefined') {
        const localStorageData = localStorage.getItem('user');
        if (localStorageData) {
          const localStorageUser = JSON.parse(localStorageData);
          this.user = localStorageUser.user;
          
          // Connect to notification WebSocket with stored token
          if (this.user.token) {
            notificationSocket.connect(this.user.id, this.user.token).then(connected => {
              if (connected) {
                console.log('Notification socket reconnected for user:', this.user.email);
              } else {
                console.error('Failed to reconnect notification socket for user:', this.user.email);
              }
            });
          }
        }
      }
    },
    removeUser() {
      notificationSocket.disconnect(); // Disconnect from WebSocket on logout
      this.user = createInitialState();
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
      }
    },
    /**
     * Updates specific fields of the user object
     * @param updatedFields An object containing the user fields to update
     */
    updateUser(updatedFields: Partial<User>) {
      // Update the user in state by merging the updated fields
      this.user = { ...this.user, ...updatedFields };
      
      // Update localStorage to persist the changes
      if (typeof window !== 'undefined') {
        const localStorageData = localStorage.getItem('user');
        if (localStorageData) {
          const parsedData = JSON.parse(localStorageData);
          const updatedData = {
            ...parsedData,
            user: this.user
          };
          localStorage.setItem("user", JSON.stringify(updatedData));
        }
      }
    },
    isLoggedIn(): boolean {
      if (typeof this.user.token === 'string' && this.user.token !== '') return true;
      return this.isLoggedInFromLocalStorage();
    },
    isSwapper(): boolean {
      return this.user.isSwapper || false;
    },
    isLoggedInFromLocalStorage(): boolean {
      if (typeof window !== 'undefined') {
        const localStorageData = localStorage.getItem('user');
        if (localStorageData !== null) {
          const localStorageUser = JSON.parse(localStorageData);
          // el token aún es válido
          return new Date(localStorageUser.ttl) > new Date(Date.now());
        }
      }
      return false;
    },
    isWorker(): boolean {
      const isValidRut = this.user.rut !== undefined && this.user.rut.length >= 11 && this.user.rut.length <= 12  
      const isValidBank = this.user.bank !== undefined && banks.find(bank => bank.name === this.user.bank) !== undefined
      const isValidAccountType = this.user.accountType !== undefined && accountType.find((accType) => accType.name === this.user.accountType) !== undefined
      const isValidAccountNumber = this.user.accountNumber !== undefined && this.user.accountNumber.length >= 6 && this.user.accountNumber.length <= 16
      return isValidRut && isValidBank && isValidAccountType && isValidAccountNumber
    }
  },
});
