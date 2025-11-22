const fs = require('fs');

const providersData = fs.readFileSync('scripts/providers-data.json', 'utf8');
const providers = JSON.parse(providersData);

const header = `/**
 * ISA Providers Data - Complete UK ISA Providers Database (2025)
 * Official list from GOV.UK - Registered Individual Savings Account (ISA) managers
 * Source: https://www.gov.uk/government/publications/list-of-individual-savings-account-managers
 * Total Providers: ${providers.length}
 */

export interface ISAProvider {
  name: string;
  types: string[]; // Cash ISA, Cash Junior ISA, Stocks & Shares ISA, Stocks & Shares Junior ISA, Lifetime ISA, Innovative Finance ISA
  category: 'bank' | 'investment-platform' | 'fintech' | 'building-society';
}

export const ISA_PROVIDERS: ISAProvider[] = `;

const providersString = JSON.stringify(providers, null, 2);

const footer = `

// Helper function to search providers by name
export const searchProviders = (query: string): ISAProvider[] => {
  if (!query.trim()) {
    return [];
  }

  const lowercaseQuery = query.toLowerCase().trim();
  return ISA_PROVIDERS.filter((provider) =>
    provider.name.toLowerCase().includes(lowercaseQuery)
  ).slice(0, 50); // Limit to 50 results for performance
};

// Helper function to filter providers by ISA type
export const getProvidersByType = (isaType: string): ISAProvider[] => {
  return ISA_PROVIDERS.filter((provider) =>
    provider.types.some((type) => type.toLowerCase().includes(isaType.toLowerCase()))
  );
};

// Get popular providers (first 20)
export const getPopularProviders = (): ISAProvider[] => {
  // Return mix of categories
  const popularNames = [
    'Hargreaves Lansdown', 'AJ Bell', 'Vanguard', 'Moneybox',
    'Barclays', 'NatWest', 'Lloyds Bank', 'HSBC',
    'Nationwide', 'Coventry', 'Yorkshire',
    'Plum', 'Monzo', 'Tembo', 'Freetrade', 'Trading 212',
    'Interactive Investor', 'Fidelity', 'Santander', 'Halifax'
  ];

  return ISA_PROVIDERS.filter(p =>
    popularNames.some(name => p.name.includes(name))
  ).slice(0, 20);
};
`;

const fullContent = header + providersString + ';' + footer;

fs.writeFileSync('constants/isaProviders.ts', fullContent);
console.log(`Generated isaProviders.ts with ${providers.length} providers`);
