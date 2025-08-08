import type { NitroFetchRequest, $Fetch } from 'nitropack';
import RepositoryFactory from './repositoryFactory';
import { Resource, type TermsAndConditions } from "@/types/resource";

/**
 * Represents a repository for managing TermsAndConditions data.
 * @extends RepositoryFactory<TermsAndConditions>
 */
export default class TermsAndConditionsRepository extends RepositoryFactory<TermsAndConditions> {
  /**
   * Creates a new TermsAndConditionsRepository instance.
   * @param fetch - The fetch function used for making API requests.
   */
  constructor(fetch: $Fetch<TermsAndConditions, NitroFetchRequest>) {
    super(Resource.TermsAndConditions, fetch);
  }
}