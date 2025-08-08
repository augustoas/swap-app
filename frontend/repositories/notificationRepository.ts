import type { NitroFetchRequest, $Fetch } from 'nitropack';
import RepositoryFactory from './repositoryFactory';
import { Resource, type Notification } from "@/types/resource";
import type { ApiResponse } from "@/types/api";

/**
 * Represents a repository for managing Notification data.
 * @extends RepositoryFactory<Notification>
 */
export default class NotificationRepository extends RepositoryFactory<Notification> {
  /**
   * Creates a new NotificationRepository instance.
   * @param fetch - The fetch function used for making API requests.
   */
  constructor(fetch: $Fetch<Notification, NitroFetchRequest>) {
    super(Resource.Notification, fetch);
  }

  public async findByCurrentAuthUser(data: any): Promise<ApiResponse<Notification[]>> {
    try {
      const response = await this.fetch<ApiResponse<Notification[]>>(this.resource + '/findByCurrentAuthUser', {
        method: "POST",
        body: data,
      });
      return response;
    } catch (error) {
      throw new Error('Ha ocurrido un error inesperado.', { cause: error });
    }
  }
}