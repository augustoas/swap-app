import type { NitroFetchRequest, $Fetch } from 'nitropack';
import RepositoryFactory from './repositoryFactory';
import { Resource, type Job } from "@/types/resource";


/**
 * Represents a repository for managing job data.
 * @extends RepositoryFactory<Job>
 */
export default class JobRepository extends RepositoryFactory<Job> {
  /**
   * Creates a new JobRepository instance.
   * @param fetch - The fetch function used for making API requests.
   */
  constructor(fetch: $Fetch<Job, NitroFetchRequest>) {
    super(Resource.Job, fetch);
  }

  /**
   * Finds all jobs that belong to the current user.
   * @returns A promise that resolves to the jobs belonging to the current user.
   */
  async findMyJobs() {
    return await this.fetch(`${this.resource}/user/jobs`, {
      method: 'GET'
    });
  }

  /**
   * Finishes a job (marks it as completed).
   * @param id - The ID of the job to finish.
   * @returns A promise that resolves to the finished job data.
   */
  async finishJob(id: string) {
    return await this.fetch(`${this.resource}/${id}/finish`, {
      method: 'PATCH'
    });
  }

  /**
   * Finds all finished jobs where the current user worked as a swapper.
   * @returns A promise that resolves to the finished jobs for the swapper.
   */
  async findSwapperFinishedJobs() {
    return await this.fetch(`${this.resource}/swapper/finished-jobs`, {
      method: 'GET'
    });
  }
}