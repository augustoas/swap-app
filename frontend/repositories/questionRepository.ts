import type { NitroFetchRequest, $Fetch } from 'nitropack';
import RepositoryFactory from './repositoryFactory';
import { Resource, type Question } from "@/types/resource";

/**
 * Represents a repository for managing Question data.
 * @extends RepositoryFactory<Question>
 */
export default class QuestionRepository extends RepositoryFactory<Question> {
  /**
   * Creates a new QuestionRepository instance.
   * @param fetch - The fetch function used for making API requests.
   */
  constructor(fetch: $Fetch<Question, NitroFetchRequest>) {
    super(Resource.Question, fetch);
  }
}