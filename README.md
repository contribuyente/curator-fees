# Curator Fees Calculator

A web application for calculating and reporting curator fees in the Decentraland ecosystem. This tool helps track curator activities and generate payment reports for the curation program.

## Features

- **Date Range Selection**: Choose specific months or custom date ranges for fee calculation
- **Curation Tracking**: View individual curator activities in chronological order
- **Fee Calculation**: Automatically calculates curator fees (1/3 of creation fees) from GraphQL data
- **Detailed Reports**: Expandable curator details showing individual curations with timestamps
- **Multisig Integration**: Export payment data as CSV format for multisig wallet transactions
- **Blockchain Links**: Direct links to Polygonscan transactions and Decentraland marketplace collections

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: CSS with dark theme
- **Data Source**: Decentraland GraphQL subgraph
- **Blockchain**: Polygon network (MANA token)
- **Libraries**:
  - `date-fns` for date manipulation
  - `viem` for wei conversions
  - Native fetch for GraphQL queries

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd curators-fees
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## How It Works

### Data Flow

1. **GraphQL Query**: Fetches curation data from Decentraland's subgraph endpoint
2. **Fee Calculation**: For each curation, calculates `creationFee ÷ 3` as curator payment
3. **Data Processing**: Groups curations by curator and aggregates totals
4. **Report Generation**: Displays results with expandable details and export options

### Fee Calculation Logic

- Each curation represents one item being reviewed by a curator
- Curator fee = `creationFee ÷ 3` (curator gets 1/3 of the creation fee)
- Amounts are converted from wei (BigNumber) to MANA for display
- CSV export converts back to wei for blockchain transactions

### Data Sources

- **GraphQL Endpoint**: `https://subgraph.decentraland.org/collections-matic-mainnet`
- **Filter**: Only collections created after timestamp `1658153853`
- **Blockchain**: Polygon network transactions
- **Token**: MANA (contract: `0x0F5D2fB29fb7d3CFeE444a200298f468908cC942`)

## Configuration

### Curator Data

The application includes a mapping of curator addresses to names and payment addresses in `src/curatorData.ts`. Update this file to add new curators or modify payment addresses.

### Date Restrictions

- Maximum date is current date (no future dates allowed)
- If current month is selected and not complete, end date defaults to today
- All dates are handled in local timezone to avoid date shifting issues

## Usage

### Generating Reports

1. **Select Date Range**: Use the month picker for quick selection or custom from/to dates
2. **View Results**: See summary statistics and curator list
3. **Expand Details**: Click on any curator row to see individual curations
4. **Export Data**: Click "Copy Multisig CSV" to get payment data for multisig wallets

### CSV Export Format

The exported CSV follows this structure for multisig wallet imports:

```csv
token_type,token_address,receiver,amount
erc20,0x0F5D2fB29fb7d3CFeE444a200298f468908cC942,{curator_address},{amount_in_wei}
```
