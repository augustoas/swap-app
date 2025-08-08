import type { NitroFetchRequest, $Fetch } from 'nitropack';
import RepositoryFactory from './repositoryFactory';
import { Resource, type Offer } from "@/types/resource";
import type { ApiResponse } from "@/types/api";

/**
 * Represents a repository for managing Offer data.
 * @extends RepositoryFactory<Offer>
 */
export default class OfferRepository extends RepositoryFactory<Offer> {
  /**
   * Creates a new OfferRepository instance.
   * @param fetch - The fetch function used for making API requests.
   */
  constructor(fetch: $Fetch<Offer, NitroFetchRequest>) {
    super(Resource.Offer, fetch);
  }

  /**
   * Finds all jobs that the current user has made offers on.
   * @returns A promise that resolves to the jobs with the user's offers.
   */
  async findMyOffers() {
    return await this.fetch(`${this.resource}/user/offers`, {
      method: 'GET'
    });
  }

  /**
   * Accepts an offer.
   * @param id - The ID of the offer to accept.
   * @returns A promise that resolves to the accepted offer data.
   */
  async acceptOffer(id: string): Promise<ApiResponse<Offer>> {
    return await this.fetch(`${this.resource}/${id}/accept`, {
      method: 'POST'
    });
  }

  /**
   * Declines an offer.
   * @param id - The ID of the offer to decline.
   * @param reason - Optional reason for declining the offer.
   * @returns A promise that resolves to the declined offer data.
   */
  async declineOffer(id: string, reason?: string): Promise<ApiResponse<Offer>> {
    return await this.fetch(`${this.resource}/${id}/decline`, {
      method: 'POST',
      body: reason ? { reason } : undefined
    });
  }
}