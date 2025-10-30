export interface Curator {
  id: string;
}

export interface Collection {
  id: string;
  createdAt: string;
  itemsCount: string;
  name: string;
  items: Array<{
    blockchainId: string;
    creationFee: string;
    metadata: {
      wearable?: {
        name: string;
      };
      emote?: {
        name: string;
      };
    };
  }>;
  isApproved: boolean;
}

export interface Curation {
  timestamp: string;
  txHash: string;
  curator: Curator;
  collection: Collection;
}

export interface CurationsResponse {
  data: {
    curations: Curation[];
  };
}

export interface CuratorInfo {
  name: string;
  paymentAddress: string;
}

export interface CuratorData {
  [address: string]: CuratorInfo;
}

export interface DateRange {
  from: Date;
  to: Date;
}

export interface CuratorFeesSummary {
  curatorId: string;
  curatorName: string;
  paymentAddress: string;
  totalFees: number;
  curationCount: number;
  curations: CurationDetail[];
}

export interface CurationDetail {
  timestamp: string;
  txHash: string;
  collectionId: string;
  collectionName: string;
  creationFee: number;
  curatorFee: number;
}

export type RangeType = "month" | "custom";
