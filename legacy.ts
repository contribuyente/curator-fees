import BigNumber from "bignumber.js";
import { curators } from "./curators";
import fetch from "isomorphic-fetch";
import { createObjectCsvWriter } from "csv-writer";

async function main() {
  const curationsList: Curation[] = [];

  while (true) {
    const res = await fetch(
      "https://subgraph.decentraland.org/collections-matic-mainnet",
      {
        headers: {
          "content-type": "application/json",
        },
        body: `{\"query\":\"{\\n    curations(orderBy: timestamp, orderDirection: asc, skip: ${curationsList.length}, first: 1000, where: { timestamp_gte: 1658153853 } ) {\\ntimestamp      curator {\\n        id\\n      }\\n      collection {\\n        id\\n        createdAt\\n        itemsCount\\n        name\\n        items {\\n          creationFee\\n        }\\n        isApproved\\n        }\\n    }\\n            }\",\"variables\":null}`,
        method: "POST",
      }
    );
    const json = await res.json();
    console.log("got n result", JSON.stringify(json, null, 2));

    if (!json.data.curations.length) break;
    curationsList.push(...json.data.curations);
    if (json.data.curations.length < 1000) break;
  }
  const collectionsList: [string, Curation][] = [];
  curationsList.sort((a, b) => {
    return +a.timestamp - +b.timestamp;
  });

  for (const curation of curationsList.filter(
    (a) => a.collection.createdAt > 1658153853
  )) {
    if (collectionsList.findIndex((a) => a[0] == curation.collection.id) >= 0) {
      continue;
    }
    collectionsList.push([curation.collection.id, curation]);
  }

  console.log(collectionsList.length);
  await exportCurations(collectionsList);
  const payment: { [curator: string]: BigNumber } = {};

  for (const collection of collectionsList) {
    if (!payment[collection[1].curator.id])
      payment[collection[1].curator.id] = new BigNumber(0);

    payment[collection[1].curator.id] = payment[collection[1].curator.id].plus(
      new BigNumber(collection[1].collection.itemsCount).multipliedBy(
        new BigNumber(collection[1].collection.items[0].creationFee).dividedBy(
          new BigNumber(3)
        )
      )
    );
  }
  let total = new BigNumber(0);
  let newPamentCSV = "token_type,token_address,receiver,amount\n";
  for (const curator in payment) {
    if (Object.prototype.hasOwnProperty.call(payment, curator)) {
      const element = payment[curator];
      total = total.plus(element);
      newPamentCSV += `erc20,0x0F5D2fB29fb7d3CFeE444a200298f468908cC942,${
        curators[curator].paymentAddress
      },${element
        .div(new BigNumber(10).pow(18))
        .minus(curators[curator].alreadyPaid)
        .toPrecision(8)}\n`;
    }
  }

  console.log("=== CSV For Gnosis Transfer ===");
  console.log(newPamentCSV);
}

void main();

async function exportCurations(collectionsList: [string, Curation][]) {
  const csvWriter = createObjectCsvWriter({
    path: "curations.csv",
    header: [
      { id: "curatorAddress", title: "Curator Address" },
      { id: "curatorName", title: "Curators Name" },
      { id: "collectionId", title: "Collection ID" },
      { id: "collectionName", title: "Collection Name" },
      { id: "collectionItems", title: "Collection Items" },
      { id: "timestamp", title: "Timestamp" },
      { id: "fee", title: "Collection fee" },
      { id: "paidFree", title: "Paid fee" },
    ],
  });

  const data = collectionsList.map(([id, curation]) => {
    return {
      curatorAddress: curation.curator.id,
      curatorName: curators[curation.curator.id].name,
      collectionId: curation.collection.id,
      collectionName: curation.collection.name,
      collectionItems: curation.collection.itemsCount,
      timestamp: curation.timestamp,
      fee: new BigNumber(curation.collection.itemsCount)
        .multipliedBy(new BigNumber(curation.collection.items[0].creationFee))
        .div(new BigNumber(10).pow(18))
        .toFixed(8, BigNumber.ROUND_FLOOR),
      paidFree: new BigNumber(curation.collection.itemsCount)
        .multipliedBy(
          new BigNumber(curation.collection.items[0].creationFee).dividedBy(
            new BigNumber(3)
          )
        )
        .div(new BigNumber(10).pow(18))
        .toFixed(8, BigNumber.ROUND_FLOOR),
    };
  });

  await csvWriter
    .writeRecords(data)
    .then(() => console.log("The CSV file was written successfully"));
}

interface Curation {
  collection: {
    id: string;
    itemsCount: number;
    items: { creationFee: string }[];
    name: string;
    createdAt: number;
  };
  curator: { id: string };
  isApproved: boolean;
  timestamp: string;
  txHash: string;
}
