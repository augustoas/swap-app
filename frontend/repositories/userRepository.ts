import type { NitroFetchRequest, $Fetch } from 'nitropack';
import RepositoryFactory from './repositoryFactory';
import { Resource, type User } from "@/types/resource";

/**
 * Represents a repository for managing user data.
 * @extends RepositoryFactory<User>
 */
export default class UserRepository extends RepositoryFactory<User> {
  /**
   * Creates a new UserRepository instance.
   * @param fetch - The fetch function used for making API requests.
   */
  constructor(fetch: $Fetch<User, NitroFetchRequest>) {
    super(Resource.User, fetch);
  }

  public async updateWorker(id: string, data: any): Promise<void> {
    try {
      const response = await this.fetch<void>(`${this.resource}/${id}/worker`, {
        method: "PATCH",
        body: data,
      });
      return response;
    } catch (error) {
      throw new Error('Ha ocurrido un error inesperado.', { cause: error });
    }
  }
}
