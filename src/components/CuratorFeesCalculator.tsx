import { useState, useEffect } from "react";
import { DateRange, CuratorFeesSummary, Curation, CurationDetail } from "../types";
import { fetchAllCurations } from "../graphqlClient";
import { curatorData } from "../curatorData";

interface CuratorFeesCalculatorProps {
  dateRange: DateRange;
  onFeesCalculated: (fees: CuratorFeesSummary[]) => void;
  onLoadingChange: (loading: boolean) => void;
}

export function CuratorFeesCalculator({
  dateRange,
  onFeesCalculated,
  onLoadingChange,
}: CuratorFeesCalculatorProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const convertBigNumberToEther = (bigNumberString: string): number => {
    // Convert BigNumber string to regular number by dividing by 10^18
    const bigNumber = BigInt(bigNumberString);
    const divisor = BigInt("1000000000000000000"); // 10^18
    const result = Number(bigNumber) / Number(divisor);
    return result;
  };


  const processCurations = (curations: Curation[]): CuratorFeesSummary[] => {
    const curatorFees = new Map<string, CuratorFeesSummary>();

    // Sort by timestamp and filter by collection.createdAt like legacy script
    const sortedCurations = curations
      .sort((a, b) => +a.timestamp - +b.timestamp)
      .filter((curation) => {
        const createdAt = parseInt(curation.collection.createdAt);
        return createdAt > 1658153853; // Same filter as legacy script
      });

    // Process each curation individually (each represents one item being curated)
    sortedCurations.forEach((curation) => {
      const curatorId = curation.curator.id.toLowerCase();
      
      const curatorInfo = curatorData[curatorId] || {
        name: "Unknown",
        paymentAddress: curatorId,
      };

      // Calculate fee for THIS curation (one item): creationFee / 3
      let curationFee = 0;
      let creationFeeAmount = 0;
      
      if (curation.collection.items && curation.collection.items.length > 0) {
        // For this curation, we pay for one item (assuming first item represents this curation)
        const creationFee = curation.collection.items[0].creationFee;
        
        if (creationFee && creationFee !== "0") {
          creationFeeAmount = convertBigNumberToEther(creationFee);
          curationFee = creationFeeAmount / 3;
        }
      }

      if (curationFee > 0) {
        const curationDetail: CurationDetail = {
          timestamp: curation.timestamp,
          txHash: curation.txHash,
          collectionId: curation.collection.id,
          collectionName: curation.collection.name,
          creationFee: creationFeeAmount,
          curatorFee: curationFee
        };

        // Update curator totals
        const existing = curatorFees.get(curatorId);
        if (existing) {
          existing.totalFees += curationFee;
          existing.curationCount += 1;
          existing.curations.push(curationDetail);
        } else {
          curatorFees.set(curatorId, {
            curatorId,
            curatorName: curatorInfo.name,
            paymentAddress: curatorInfo.paymentAddress,
            totalFees: curationFee,
            curationCount: 1,
            curations: [curationDetail]
          });
        }
      }
    });

    return Array.from(curatorFees.values())
      .filter((summary) => summary.totalFees > 0)
      .sort((a, b) => b.totalFees - a.totalFees);
  };

  useEffect(() => {
    const fetchAndCalculateFees = async () => {
      setLoading(true);
      onLoadingChange(true);
      setError(null);

      try {
        console.log("Fetching curations for date range:", dateRange);
        const response = await fetchAllCurations(dateRange);
        console.log("GraphQL response:", response);
        const curatorSummaries = processCurations(response.data.curations);
        console.log("Processed curator summaries:", curatorSummaries);
        onFeesCalculated(curatorSummaries);
      } catch (err) {
        console.error("Error fetching curations:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch curation data";
        setError(errorMessage);
        onFeesCalculated([]);
      } finally {
        setLoading(false);
        onLoadingChange(false);
      }
    };

    fetchAndCalculateFees();
  }, [dateRange]);

  if (loading) {
    return (
      <div className="loading">
        <p>Loading curation data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <p>Error: {error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return null;
}
