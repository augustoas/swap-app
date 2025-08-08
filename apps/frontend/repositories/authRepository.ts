import type { NitroFetchRequest, $Fetch } from 'nitropack';
import RepositoryFactory from './repositoryFactory';
import { Resource, type User } from "@/types/resource";
import type { ApiResponse } from "@/types/api";

/**
 * Represents an authentication repository.
 * @extends RepositoryFactory<User>
 */
export default class AuthRepository extends RepositoryFactory<User> {
  /**
   * Constructs a new AuthRepository instance.
   * @param fetch - The fetch function used for making API requests.
   */
  constructor(fetch: $Fetch<User, NitroFetchRequest>) {
    super(Resource.Auth, fetch);
  }

  /**
   * Logs in a user with the provided data.
   * @param data - The login data.
   * @returns A promise that resolves to an ApiResponse containing the user and token.
   * @throws An error if an unexpected error occurs during the login process.
   */
  public async login(data: any): Promise<ApiResponse<{user: User, token: string}>> {
    try {
      const response = await this.fetch<ApiResponse<{user: User, token: string}>>(this.resource + '/signin', {
        method: "POST",
        body: data,
      });
      return response;
    } catch (error) {
      throw new Error('Ha ocurrido un error inesperado.', { cause: error });
    }
  }

  public async register(data: any): Promise<ApiResponse<User>> {
    try {
      const response = await this.fetch<ApiResponse<User>>(this.resource + '/signup', {
        method: "POST",
        body: data,
      });
      return response;
    } catch (error) {
      throw new Error('Ha ocurrido un error inesperado.', { cause: error });
    }
  }

  public async forgotPassword(data: any): Promise<ApiResponse<any>> {
    try {
      const response = await this.fetch<ApiResponse<any>>(this.resource + '/forgotpassword', {
        method: "POST",
        body: data,
      });
      return response;
    } catch (error) {
      throw new Error('Ha ocurrido un error inesperado.', { cause: error });
    }
  }

  public async resetPassword(data: any): Promise<ApiResponse<any>> {
    try {
      const response = await this.fetch<ApiResponse<any>>(this.resource + '/resetpassword', {
        method: "POST",
        body: data,
      });
      return response;
    } catch (error) {
      throw new Error('Ha ocurrido un error inesperado.', { cause: error });
    }
  }

  public async confirmEmail(token: string): Promise<ApiResponse<any>> {
    try {
      const response = await this.fetch<ApiResponse<any>>(this.resource + '/confirmemail/' + token, {
        method: "GET",
      });
      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Ha ocurrido un error inesperado.', { cause: error });
    }
  }
}