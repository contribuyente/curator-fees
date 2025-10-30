import React, { useState } from 'react';
import { format } from 'date-fns';
import { parseEther } from 'viem';
import { CuratorFeesSummary, DateRange } from '../types';

interface CuratorFeesReportProps {
  fees: CuratorFeesSummary[];
  dateRange: DateRange;
  isLoading: boolean;
}

export function CuratorFeesReport({ fees, isLoading }: CuratorFeesReportProps) {
  const [expandedCurator, setExpandedCurator] = useState<string | null>(null);
  
  const totalFees = fees.reduce((sum, curator) => sum + curator.totalFees, 0);
  const totalCurations = fees.reduce((sum, curator) => sum + curator.curationCount, 0);

  const formatMANA = (amount: number) => {
    return `${Number(amount.toFixed(2)).toLocaleString()} MANA`;
  };

  const toggleCuratorExpansion = (curatorId: string) => {
    setExpandedCurator(expandedCurator === curatorId ? null : curatorId);
  };

  const getPolygonscanUrl = (txHash: string) => 
    `https://polygonscan.com/tx/${txHash}`;

  const getCollectionUrl = (collectionId: string) => 
    `https://decentraland.org/marketplace/collections/${collectionId}`;

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(parseInt(timestamp) * 1000);
    return format(date, 'MMM dd, yyyy HH:mm');
  };

  const copyToClipboard = () => {
    const csvText = generateMultisigCSV();
    navigator.clipboard.writeText(csvText);
    alert('Multisig CSV copied to clipboard!');
  };

  const generateMultisigCSV = () => {
    let csv = 'token_type,token_address,receiver,amount\n';
    
    fees.forEach(curator => {
      // Convert MANA amount to wei using viem's parseEther
      const totalAmountWei = parseEther(curator.totalFees.toString()).toString();
      csv += `erc20,0x0F5D2fB29fb7d3CFeE444a200298f468908cC942,${curator.paymentAddress},${totalAmountWei}\n`;
    });
    
    return csv;
  };

  if (isLoading) {
    return (
      <div className="loading">
        <div className="loader"></div>
        <p>Loading curation data...</p>
      </div>
    );
  }

  if (fees.length === 0) {
    return (
      <div className="no-data">
        <p>No curator fees found for the selected date range.</p>
      </div>
    );
  }

  return (
    <div className="curator-fees-report">
      <div className="report-summary">
        <div className="summary-stats">
          <div className="stat">
            <span className="stat-label">Total Curators:</span>
            <span className="stat-value">{fees.length}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Total Curations:</span>
            <span className="stat-value">{totalCurations}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Total Fees:</span>
            <span className="stat-value">{formatMANA(totalFees)}</span>
          </div>
        </div>
        <button onClick={copyToClipboard} className="copy-button">
          Copy Multisig CSV
        </button>
      </div>

      <div className="fees-table">
        {/* Desktop/Tablet Table View */}
        <table>
          <thead>
            <tr>
              <th>Curator</th>
              <th>Payment Address</th>
              <th>Curations</th>
              <th>Total Fees</th>
            </tr>
          </thead>
          <tbody>
            {fees.map((curator) => (
              <React.Fragment key={curator.curatorId}>
                <tr 
                  className="curator-row" 
                  onClick={() => toggleCuratorExpansion(curator.curatorId)}
                  style={{ cursor: 'pointer' }}
                >
                  <td className="curator-name">
                    <span className="expand-icon">
                      {expandedCurator === curator.curatorId ? '▼' : '▶'}
                    </span>
                    {curator.curatorName}
                  </td>
                  <td className="payment-address">
                    <span className="address">{curator.paymentAddress}</span>
                  </td>
                  <td className="curation-count">{curator.curationCount}</td>
                  <td className="fees">{formatMANA(curator.totalFees)}</td>
                </tr>
                
                {expandedCurator === curator.curatorId && (
                  <tr>
                    <td colSpan={4} className="curator-details">
                      <div className="curations-list">
                        <h4>Curations ({curator.curationCount}) - Chronological Order</h4>
                        <div className="curations-table">
                          <div className="curation-header">
                            <span>Date</span>
                            <span>Collection</span>
                            <span>Creation Fee</span>
                            <span>Curator Fee</span>
                            <span>Transaction</span>
                          </div>
                          {curator.curations.map((curation, index) => (
                            <div key={`${curation.txHash}-${index}`} className="curation-row">
                              <span className="curation-date" data-label="Date: ">
                                {formatTimestamp(curation.timestamp)}
                              </span>
                              <span className="curation-collection" data-label="Collection: ">
                                <a 
                                  href={getCollectionUrl(curation.collectionId)} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="collection-link"
                                >
                                  {curation.collectionName}
                                </a>
                              </span>
                              <span className="curation-creation-fee" data-label="Creation Fee: ">
                                {formatMANA(curation.creationFee)}
                              </span>
                              <span className="curation-curator-fee" data-label="Curator Fee: ">
                                {formatMANA(curation.curatorFee)}
                              </span>
                              <span className="curation-tx" data-label="Transaction: ">
                                <a 
                                  href={getPolygonscanUrl(curation.txHash)} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="tx-link"
                                >
                                  View TX
                                </a>
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>

        {/* Mobile Card View */}
        <div className="mobile-curator-list">
          {fees.map((curator) => (
            <div key={`mobile-${curator.curatorId}`} className="mobile-curator-card">
              <div 
                className="mobile-curator-header"
                onClick={() => toggleCuratorExpansion(curator.curatorId)}
              >
                <div className="mobile-curator-info">
                  <div className="mobile-curator-name">
                    <span className="expand-icon">
                      {expandedCurator === curator.curatorId ? '▼' : '▶'}
                    </span>
                    {curator.curatorName}
                  </div>
                  <div className="mobile-curator-stats">
                    <span className="mobile-curator-address">{curator.paymentAddress}</span>
                    <span className="mobile-curator-fees">{formatMANA(curator.totalFees)}</span>
                  </div>
                  <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--secondary-text)' }}>
                    {curator.curationCount} curations
                  </div>
                </div>
              </div>
              
              {expandedCurator === curator.curatorId && (
                <div className="mobile-curator-details">
                  <h4 className="mobile-curations-header">
                    Curations ({curator.curationCount}) - Chronological Order
                  </h4>
                  {curator.curations.map((curation, index) => (
                    <div key={`mobile-${curation.txHash}-${index}`} className="mobile-curation-item">
                      <div className="mobile-curation-row">
                        <span className="mobile-curation-label">Date</span>
                        <span className="mobile-curation-value">
                          {formatTimestamp(curation.timestamp)}
                        </span>
                      </div>
                      <div className="mobile-curation-row">
                        <span className="mobile-curation-label">Collection</span>
                        <span className="mobile-curation-value">
                          <a 
                            href={getCollectionUrl(curation.collectionId)} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="mobile-collection-link"
                          >
                            {curation.collectionName}
                          </a>
                        </span>
                      </div>
                      <div className="mobile-curation-row">
                        <span className="mobile-curation-label">Creation Fee</span>
                        <span className="mobile-curation-value">
                          {formatMANA(curation.creationFee)}
                        </span>
                      </div>
                      <div className="mobile-curation-row">
                        <span className="mobile-curation-label">Curator Fee</span>
                        <span className="mobile-curation-value">
                          {formatMANA(curation.curatorFee)}
                        </span>
                      </div>
                      <div className="mobile-curation-row">
                        <span className="mobile-curation-label">Transaction</span>
                        <span className="mobile-curation-value">
                          <a 
                            href={getPolygonscanUrl(curation.txHash)} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="mobile-tx-link"
                          >
                            View TX
                          </a>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}