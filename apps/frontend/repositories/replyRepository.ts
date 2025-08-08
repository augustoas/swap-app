import type { NitroFetchRequest, $Fetch } from 'nitropack';
import RepositoryFactory from './repositoryFactory';
import { Resource, type Reply } from "@/types/resource";

/**
 * Represents a repository for managing Reply data.
 * @extends RepositoryFactory<Reply>
 */
export default class ReplyRepository extends RepositoryFactory<Reply> {
  /**
   * Creates a new ReplyRepository instance.
   * @param fetch - The fetch function used for making API requests.
   */
  constructor(fetch: $Fetch<Reply, NitroFetchRequest>) {
    super(Resource.Reply, fetch);
  }
}