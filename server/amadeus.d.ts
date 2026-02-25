declare module "amadeus" {
  export interface AmadeusClientOptions {
    clientId: string;
    clientSecret: string;
    hostname?: string;
  }

  class Amadeus {
    constructor(options: AmadeusClientOptions);
    shopping: {
      flightOffersSearch: {
        get(params: Record<string, unknown>): Promise<any>;
      };
    };
  }

  export default Amadeus;
}
