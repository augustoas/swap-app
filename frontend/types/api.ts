/**
 * Represents the response from an API call.
 * @template T - The type of the payload in the response.
 */
export type ApiResponse<T> = {
  payload: T;
  message?: string;
};

/**
 * Represents an API interface for performing CRUD operations on a resource of type T.
 * @template T - The type of the resource.
 */
export interface ApiInterface<T> {
  /**
   * Creates a new resource.
   * @param data - The data of the resource to be created.
   * @returns A Promise that resolves when the resource is created successfully.
   */
  create(data: T): Promise<void>;

  /**
   * Finds a resource by its ID.
   * @param id - The ID of the resource to find.
   * @returns A Promise that resolves with the found resource or null if not found.
   */
  findOne(id: string): Promise<ApiResponse<T> | null>;

  /**
   * Finds all resources.
   * @returns A Promise that resolves with an array of all the resources.
   */
  findAll(): Promise<ApiResponse<T[]>>;

  /**
   * Updates an existing resource.
   * @param data - The updated data of the resource.
   * @returns A Promise that resolves when the resource is updated successfully.
   */
  update(id: string, data: T): Promise<void>

  /**
   * Deletes a resource by its ID.
   * @param id - The ID of the resource to delete.
   * @returns A Promise that resolves when the resource is deleted successfully.
   */
  delete(id: string): Promise<void>;
}