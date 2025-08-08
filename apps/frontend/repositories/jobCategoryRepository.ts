import type { NitroFetchRequest, $Fetch } from 'nitropack';
import RepositoryFactory from './repositoryFactory';
import { Resource, type JobCategory } from "@/types/resource";

/**
 * Represents a repository for managing jobCategory data.
 * @extends RepositoryFactory<JobCategory>
 */
export default class JobCategoryRepository extends RepositoryFactory<JobCategory> {
  /**
   * Creates a new JobCategoryRepository instance.
   * @param fetch - The fetch function used for making API requests.
   */
  constructor(fetch: $Fetch<JobCategory, NitroFetchRequest>) {
    super(Resource.JobCategory, fetch);
  }
}