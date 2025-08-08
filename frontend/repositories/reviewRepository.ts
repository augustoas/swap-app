import type { NitroFetchRequest, $Fetch } from 'nitropack';
import RepositoryFactory from './repositoryFactory';
import { Resource, type Review } from "@/types/resource";

/**
 * Represents a repository for managing Review data.
 * @extends RepositoryFactory<Review>
 */
export default class ReviewRepository extends RepositoryFactory<Review> {
  /**
   * Creates a new ReviewRepository instance.
   * @param fetch - The fetch function used for making API requests.
   */
  constructor(fetch: $Fetch<Review, NitroFetchRequest>) {
    super(Resource.Review, fetch);
  }
}