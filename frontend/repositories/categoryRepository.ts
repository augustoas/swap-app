import type { NitroFetchRequest, $Fetch } from 'nitropack';
import RepositoryFactory from './repositoryFactory';
import { Resource, type Category } from "@/types/resource";

/**
 * Represents a repository for managing category data.
 * @extends RepositoryFactory<Category>
 */
export default class CategoryRepository extends RepositoryFactory<Category> {
  /**
   * Creates a new CategoryRepository instance.
   * @param fetch - The fetch function used for making API requests.
   */
  constructor(fetch: $Fetch<Category, NitroFetchRequest>) {
    super(Resource.Category, fetch);
  }
}