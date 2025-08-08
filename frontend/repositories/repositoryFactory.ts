import type { NitroFetchRequest, $Fetch } from 'nitropack';
import type { ApiResponse, ApiInterface } from "@/types/api";
import type { Resource } from "@/types/resource";

/**
 * Represents a generic repository factory that implements the `ApiInterface` interface.
 * @template T - The type of data handled by the repository.
 */
export default class RepositoryFactory<T> implements ApiInterface<T> {
  protected resource: Resource;
  protected fetch: $Fetch<T, NitroFetchRequest>;

  /**
   * Creates an instance of RepositoryFactory.
   * @param {Resource} resource - The resource associated with the repository.
   * @param {$Fetch<T, NitroFetchRequest>} fetch - The fetch function used to make API requests.
   */
  constructor(resource: Resource, fetch: $Fetch<T, NitroFetchRequest>) {
    this.resource = resource;
    this.fetch = fetch;
  }

  /**
   * Creates a new resource.
   * @param {any} data - The data used to create the resource.
   * @returns {Promise<void>} A promise that resolves when the resource is created.
   * @throws {Error} If an unexpected error occurs.
   */
  public async create(data: any): Promise<void> {
    try {
      const response = await this.fetch<void>(this.resource, {
        method: "POST",
        body: data,
      });
      return response;
    } catch (error) {
      throw new Error('Ha ocurrido un error inesperado.', { cause: error });
    }
  }

  /**
   * Finds a resource by its ID.
   * @param {string} id - The ID of the resource to find.
   * @returns {Promise<ApiResponse<T> | null>} A promise that resolves with the found resource or null if not found.
   * @throws {Error} If an unexpected error occurs.
   */
  public async findOne(id: string): Promise<ApiResponse<T> | null> {
    try {
      const response = await this.fetch<ApiResponse<T> | null>(`${this.resource}/${id}`, {
        method: "GET",
      });
      return response;
    } catch (error) {
      throw new Error('Ha ocurrido un error inesperado.', { cause: error });
    }
  }

  /**
   * Finds all resources.
   * @returns {Promise<ApiResponse<T[]>>} A promise that resolves with an array of resources.
   * @throws {Error} If an unexpected error occurs.
   */
  public async findAll(): Promise<ApiResponse<T[]>> {
    try {
      const response = await this.fetch<ApiResponse<T[]>>(this.resource, {
        method: "GET",
      });
      return response;
    } catch (error) {
      throw new Error('Ha ocurrido un error inesperado.', { cause: error });
    }
  }

  /**
   * Updates a resource by its ID.
   * @param {string} id - The ID of the resource to update.
   * @param {any} data - The data used to update the resource.
   * @returns {Promise<void>} A promise that resolves when the resource is updated.
   * @throws {Error} If an unexpected error occurs.
   */
  public async update(id: string, data: any): Promise<void> {
    try {
      const response = await this.fetch<void>(`${this.resource}/${id}`, {
        method: "PATCH", // Use PATCH to match the backend update method
        body: data,
      });
      return response;
    } catch (error) {
      throw new Error('Ha ocurrido un error inesperado.', { cause: error });
    }
  }

  /**
   * Deletes a resource by its ID.
   * @param {string} id - The ID of the resource to delete.
   * @returns {Promise<void>} A promise that resolves when the resource is deleted.
   * @throws {Error} If an unexpected error occurs.
   */
  public async delete(id: string): Promise<void> {
    try {
      const response = await this.fetch<void>(`${this.resource}/${id}`, {
        method: "DELETE",
      });
      return response;
    } catch (error) {
      throw new Error('Ha ocurrido un error inesperado.', { cause: error });
    }
  }
}