import { CurationsResponse, DateRange } from "./types";

const GRAPHQL_ENDPOINT =
  "https://corsproxy.io/?url=https://subgraph.decentraland.org/collections-matic-mainnet";

export async function fetchCurations(
  dateRange: DateRange,
  skip: number = 0
): Promise<CurationsResponse> {
  const fromTimestamp = Math.floor(dateRange.from.getTime() / 1000);
  const toTimestamp = Math.floor(dateRange.to.getTime() / 1000);

  const body = `{\"query\":\"{\\n    curations(orderBy: timestamp, orderDirection: asc, skip: ${skip}, first: 1000, where: { timestamp_gte: ${fromTimestamp}, timestamp_lte: ${toTimestamp} } ) {\\n      timestamp\\n      txHash\\n      curator {\\n        id\\n      }\\n      collection {\\n        id\\n        createdAt\\n        itemsCount\\n        name\\n        items {\\n          blockchainId\\n          creationFee\\n          metadata {\\n            wearable {\\n              name\\n            }\\n            emote {\\n              name\\n            }\\n          }\\n        }\\n        isApproved\\n      }\\n    }\\n}\",\"variables\":null}`;

  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: body,
  });

  if (!response.ok) {
    throw new Error(`GraphQL request failed: ${response.statusText}`);
  }

  return response.json();
}

export async function fetchAllCurations(
  dateRange: DateRange
): Promise<CurationsResponse> {
  let allCurations: any[] = [];
  let skip = 0;
  const batchSize = 1000;

  while (true) {
    const response = await fetchCurations(dateRange, skip);
    const curations = response.data.curations;

    if (curations.length === 0) {
      break;
    }

    allCurations = [...allCurations, ...curations];

    if (curations.length < batchSize) {
      break;
    }

    skip += batchSize;
  }

  return {
    data: {
      curations: allCurations,
    },
  };
}
