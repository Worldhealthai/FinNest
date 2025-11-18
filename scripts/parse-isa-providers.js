// Script to parse ISA providers from the government document
const fs = require('fs');

const rawData = `Abrdn Fund Managers Limited	Stocks and Shares
Abundance Investment Limited (trading as	Cash, Innovative Finance ISA, Stocks and Shares
4 Northumberland Buildings	Stocks and Shares
Aegon Asset Management UK plc	Stocks and Shares
Aegon Investment Solutions Limited (trading as	Cash
AJ Bell Securities Limited	Stocks and Shares, Lifetime ISA
Al Rayan Bank plc	Cash, Cash Junior ISA
Alder Investment Management Limited	Stocks and Shares, Stocks and Shares Junior ISA
Aldermore Bank plc (trading as Aldermore)	Cash
Allianz Global Investors UK Limited (trading as Allianz	Stocks and Shares
Alpha Real property Investment Advisers LLP (trading	Stocks and Shares
APM Capital Markets Limited	Stocks and Shares
Apollo Multi Asset Management LLP	Stocks and Shares
Arbuthnot Latham & Co Limited	Cash, Stocks and Shares
ArchOver Limited (trading as ArchOver)	Innovative Finance ISA
Alexandra Buildings	Cash, Stocks and Shares
Artemis Fund Managers Limited	Stocks and Shares
Assetz SME Capital Limited (trading as Assetz Capital)	Innovative Finance ISA
Atom Bank Plc (trading as Atom Bank)	Cash
Atomos Investments Limited	Stocks and Shares, Stocks and Shares Junior ISA
Aviation and Tech Capital Limited (trading as Ablrate)	Innovative Finance ISA
Aviva Investment Solutions UK Limited	Cash, Stocks and Shares
Aviva Investors UK Fund Services Limited	Cash, Stocks and Shares
Aviva Life & Pensions UK Limited (trading as Aviva)	Stocks and Shares
Aviva Wrap UK Limited	Stocks and Shares, Stocks and Shares Junior ISA
AXA Investment Managers UK Limited	Stocks and Shares
Bank J. Safra Sarasin (Gibraltar) Ltd	Stocks and Shares, Stocks and Shares Junior ISA
Bank of East Asia Ltd	Cash
Bank of Ireland UK plc (trading as Bank of Ireland UK)	Cash
Bank Pictet & Cie (Europe) AG London Branch	Stocks and Shares, Stocks and Shares Junior ISA
Bank of Scotland plc	Cash, Cash Junior ISA
Barclays Bank plc	Cash, Stocks and Shares
Barclays Bank UK plc (trading as Barclays)	Cash
Barclays Investment Solutions Limited	Cash, Stocks and Shares
Barratt & Cooke Ltd	Cash, Stocks and Shares
Bath Investment & Building Society	Cash, Lifetime ISA
Bayonet Ventures LLP (trading as Bayonet)	Innovative Finance ISA
Bedworth and Bulkington Credit Union Limited	Cash
Beverley Building Society	Cash
Lewis Building	Cash
Blackfinch Investments Limited	Stocks and Shares
Blackrock Investment Management (UK) Limited	Cash, Stocks and Shares
BNY Mellon Fund Managers Limited	Cash, Stocks and Shares
Bordier & Cie (UK) plc	Stocks and Shares
Bramdean Asset Management LLP	Cash, Stocks and Shares, Innovative Finance ISA
The Emerson Building	Cash
Brewin Dolphin Limited	Cash, Stocks and Shares
Brewin Dolphin Wealth Management Limited	Stocks and Shares, Stocks and Shares Junior ISA
British Pearl Limited (trading as British Pearl)	Innovative Finance ISA, Stocks and Shares
Brooks MacDonald Asset Management Limited	Lifetime ISA, Stocks and Shares
Brown Advisory Limited	Stocks and Shares, Stocks and Shares Junior ISA
Brown Shipley & Co Ltd	Cash, Stocks and Shares
Buckinghamshire Building Society	Cash
Cambridge Building Society	Cash
Canaccord Genuity Wealth Limited	Stocks and Shares
Capel Court Public Limited Company	Stocks and Shares
Capital Credit Union Limited (trading as Capital Credit	Cash
Carne Global Fund Managers (UK) Limited	Stocks and Shares, Stocks and Shares Junior ISA
CASFS Limited	Stocks and Shares
Castle Trust Capital plc	Cash
Castlefield Investment Partners LLP	Stocks and Shares
Causeway Securities Limited (trading as Causeway	Cash, Stocks and Shares
Central Liverpool Credit Union Limited	Cash, Cash Junior ISA
Charter Savings Bank	Cash
Charteris Treasury Portfolio Managers Limited	Stocks and Shares
Chetwood Financial Limited	Cash
Citibank UK Ltd	Stocks and Shares
City Asset Management plc	Stocks and Shares
Clearbank Limited	Cash
Clockwise Credit Union Limited	Cash
Close Brothers Limited	Cash
Clydesdale Bank plc (trading as Virgin Money)	Cash
CMC Markets Investments Limited	Cash, Cash Junior ISA, Stocks and Shares
Cofunds Limited	Stocks and Shares, Stocks and Shares Junior ISA
Columbia Threadneedle Fund Management Limited	Stocks and Shares
Columbia Threadneedle Management Limited	Stocks and Shares, Stocks and Shares Junior ISA
Commsave Credit Union Limited	Cash
ConBrio Fund Partners Limited	Stocks and Shares, Stocks and Shares Junior ISA
Connor Broadley Limited	Cash, Cash Junior ISA, Stocks and Shares
Consistent Unit Trust Management Company Limited	Stocks and Shares
Courtiers Investment Services Limited	Cash, Stocks and Shares
Coventry Building Society	Cash, Stocks and Shares
Credo Capital Ltd	Stocks and Shares, Stocks and Shares Junior ISA
Crowd for Angels (UK) Limited	Innovative Finance ISA
Crowd2Fund Limited	Innovative Finance ISA
Crowdstacker Limited (trading as Crowdstacker)	Cash, Innovative Finance ISA, Stocks and Shares
Cumberland Building Society	Cash
Cushon Money Limited (trading as Cushon)	Cash, Stocks and Shares, Cash Junior ISA
Cynergy Bank plc	Cash
Darlington Building Society	Cash
DB UK Bank Limited	Stocks and Shares
Denmark Square Limited (trading as Money & Co)	Innovative Finance ISA
Digital Moneybox Limited	Stocks and Shares, Stocks and Shares Junior ISA
Dolfin Financial (UK) Limited	Stocks and Shares
Downing LLP (trading as Downing Crowd)	Innovative Finance ISA
7 Harbour Buildings	Cash
Dura Capital Limited (trading as Dura Capital)	Cash, Stocks and Shares
Earl Shilton Building Society	Cash
Ecology Building Society	Cash
Edaid Limited (trading as Edaid)	Innovative Finance ISA
EdenTree Investment Management Limited	Stocks and Shares
Edinburgh Alternative Finance Ltd (trading as Lending	Innovative Finance ISA
EFG Private Bank Limited	Stocks and Shares
Elevate Portfolio Services Limited	Cash, Stocks and Shares
Elfin Market Limited (trading as Elfin Market)	Innovative Finance ISA
Embark Investment Services Limited	Cash, Cash Junior ISA, Stocks and Shares
E-Money Capital Limited	Innovative Finance ISA
Emoneyhub Limited (trading as Justus)	Innovative Finance ISA
Equiniti Financial Services Limited	Lifetime ISA, Stocks and Shares
Erewash Credit Union Limited	Cash
eToro (UK) Ltd (trading as eToro UK)	Cash, Cash Junior ISA, Stocks and Shares
Evelyn Partners Asset Management Limited	Cash, Stocks and Shares, Cash Junior ISA
Evelyn Partners Fund Solutions Limited	Stocks and Shares
Evelyn Partners Investment Services Limited	Stocks and Shares, Stocks and Shares Junior ISA
Family Assurance Friendly Society Limited	Stocks and Shares, Stocks and Shares Junior ISA
Family Equity Plan Limited (trading as OneFamily)	Cash, Stocks and Shares
Farley & Thompson LLP	Stocks and Shares
FCE Bank plc (trading as Ford Money)	Cash
Financial Administration Services Limited	Cash, Stocks and Shares, Lifetime ISA
First Sentier Investors (UK) Funds Ltd	Cash, Stocks and Shares
Fiske plc	Stocks and Shares
Fluro Platform Limited (trading as Fluro)	Innovative Finance ISA
FNZ Securities Limited	Cash, Stocks and Shares
Focus 2020 Limited	Innovative Finance ISA
Folk2Folk Limited	Innovative Finance ISA
Forester Life Limited (trading as Foresters Financial)	Stocks and Shares, Stocks and Shares Junior ISA
Franklin Templeton Fund Management Limited	Stocks and Shares
Freetrade Limited (trading as Freetrade)	Stocks and Shares
Fund Ourselves Limited	Innovative Finance ISA
Funding Circle Limited (trading as Funding Circle)	Innovative Finance ISA
FundingSecure Limited	Innovative Finance ISA
Fundment Limited (trading as Fundment)	Cash, Cash Junior ISA, Stocks and Shares
FundRock Partners Limited	Stocks and Shares
Fundsmith LLP	Stocks and Shares
Furness Building Society	Cash
Fusion Wealth Limited	Stocks and Shares
Gallium P E Depositary Limited	Cash, Cash Junior ISA, Stocks and Shares
Gatehouse Bank plc	Cash
GHC Capital Markets Limited	Cash, Stocks and Shares
Glasgow Credit Union Limited	Cash
Global Investment Strategy UK Limited	Cash, Stocks and Shares
Goji Financial Services Ltd	Innovative Finance ISA
Goldman Sachs International Bank	Cash, Stocks and Shares
Graphene Platforms Limited (trading as Graphene)	Stocks and Shares, Stocks and Shares Junior ISA
Great Western Credit Union Limited	Cash
Growth Capital Ventures Limited	Innovative Finance ISA
Halifax Share Dealing Limited	Stocks and Shares
Halo Invest Limited (trading as Halo Invest)	Stocks and Shares, Stocks and Shares Junior ISA
Hampshire Credit Union Limited	Cash
Hampshire Trust Bank plc	Cash
Handelsbanken plc	Cash
Handelsbanken Wealth and Asset Management Limited	Cash, Stocks and Shares
Hanley Economic Building Society	Cash
Hargreaves Lansdown Asset Management Limited	Cash, Lifetime ISA, Stocks and Shares
Hargreaves Lansdown Savings Limited	Cash
Harpenden Building Society	Cash
Hathaway Investment Management Limited	Stocks and Shares
HBOS Investment Fund Managers Limited	Stocks and Shares
Hedley & Company Stockbrokers Ltd	Cash, Stocks and Shares
Henderson Rowe Limited	Cash, Stocks and Shares
Hilbert Investment Solutions Ltd	Cash, Stocks and Shares
Hinckley and Rugby Building Society	Cash
HNW Lending Limited (trading as HNW Lending)	Innovative Finance ISA
Housemartin Property Limited	Innovative Finance ISA
HSBC UK Bank plc (trading as HSBC UK)	Cash, Stocks and Shares
Hubwise Securities Limited	Stocks and Shares, Stocks and Shares Junior ISA
IBP Markets Limited (trading as IBP Markets)	Cash, Cash Junior ISA, Stocks and Shares
iDealing.Com Limited	Cash, Stocks and Shares, Innovative Finance ISA
iFAST Global Bank Limited	Cash
IFG.VC Limited (trading as Cur8 Capital)	Innovative Finance ISA
IG Trading & Investments Limited	Stocks and Shares
IM Asset Management Limited	Cash, Stocks and Shares
Independent Order of Odd Fellows Friendly Society Limited (trading as The Oddfellows)	Cash, Stocks and Shares, Lifetime ISA
Integrated Financial Arrangements Limited	Cash, Lifetime ISA, Stocks and Shares
Interactive Brokers (U.K.) Limited	Stocks and Shares
Interactive Investor Services Limited	Cash, Stocks and Shares
Invesco Fund Managers Limited	Cash, Stocks and Shares
Investment HCP Building	Innovative Finance ISA
Investec Bank plc	Cash, Stocks and Shares
Investec Wealth & Investment Limited	Cash, Stocks and Shares
Investengine (UK) Limited (trading as Investengine)	Stocks and Shares
Investment Funds Direct Limited	Stocks and Shares
Investment Fund Services Limited	Cash, Stocks and Shares
Invinitive Financial UK Ltd	Stocks and Shares, Stocks and Shares Junior ISA
ITI Capital Limited	Stocks and Shares
J & E Davy (UK) Limited (trading as Davy UK)	Stocks and Shares, Stocks and Shares Junior ISA
J M Finn & Co Ltd	Stocks and Shares
J. Edward Sellars & Partners Limited	Cash, Stocks and Shares
James Brearley & Sons Limited	Cash, Stocks and Shares
James Hambro & Partners LLP	Cash, Stocks and Shares
James Hay Wrap Managers Limited	Cash, Stocks and Shares
5 Bank Street	Stocks and Shares
Janus Henderson Fund Management UK Limited	Stocks and Shares
Jarvis Investment Management Ltd	Stocks and Shares, Stocks and Shares Junior ISA
Julian Hodge Bank Limited	Cash
Zig Zag Building	Stocks and Shares
Kidstart Limited (trading as Kidstart)	Stocks and Shares, Stocks and Shares Junior ISA
Killik & Co LLP	Cash, Stocks and Shares, Lifetime ISA
King & Shaxson Asset Management Limited	Stocks and Shares
Kingdom Bank Limited	Cash
Kroo Bank Ltd (trading as Kroo Bank)	Cash
Kuflink Limited	Innovative Finance ISA
Landlordinvest Limited (trading as Landlordinvest)	Innovative Finance ISA
Leeds Building Society	Cash
Westminster Buildings	Cash
Leek United Building Society	Cash
Legal & General (Unit Trust Managers) Limited	Cash, Stocks and Shares
Lendwise Limited (trading as Lendwise)	Innovative Finance ISA
LGT Wealth Management UK LLP	Stocks and Shares
Lightyear U.K. Ltd	Cash, Cash Junior ISA, Stocks and Shares
Link Fund Solutions Limited	Stocks and Shares
Liontrust Fund Partners LLP	Stocks and Shares
Liverpool Victoria Financial Services Ltd	Stocks and Shares
Lloyds Bank plc	Cash, Cash Junior ISA, Stocks and Shares
Loanpad Limited	Innovative Finance ISA
Logic Investments Limited	Cash, Stocks and Shares
London House Exchange Limited	Innovative Finance ISA, Stocks and Shares
London Mutual Credit Union Limited	Cash
London Plus Credit Union Ltd	Cash, Cash Junior ISA
Loughborough Building Society	Cash
M & G Securities Limited	Stocks and Shares
Maitland Institutional Services Limited	Stocks and Shares
Man Fund Management UK Limited	Stocks and Shares
Margetts Fund Management Limited	Stocks and Shares
Market Harborough Building Society	Cash
Marks & Spencer Financial Services plc	Cash, Stocks and Shares
Marks and Spencer Unit Trust Management Limited	Stocks and Shares
Marsden Building Society	Cash
Match the Cash Limited	Innovative Finance ISA
Maunby Investment Management Limited	Stocks and Shares, Stocks and Shares Junior ISA
McInroy & Wood Limited	Stocks and Shares, Stocks and Shares Junior ISA
McInroy & Wood Portfolios Limited	Stocks and Shares, Stocks and Shares Junior ISA
Melton Mowbray Building Society	Cash
Mercer Ltd	Stocks and Shares
Metlife UK Limited (trading as Metlife)	Stocks and Shares
MES Financial Services Ltd (trading as MyExpatSIPP)	Stocks and Shares, Stocks and Shares Junior ISA
Meteor Asset Management Limited	Cash, Stocks and Shares
Methodist Chapel Aid Limited	Cash, Stocks and Shares
Metro Bank plc	Cash
Metropolitan Police Friendly Society Ltd	Cash, Lifetime ISA, Stocks and Shares
MFM Investment Ltd (trading as Moneyfarm)	Cash, Stocks and Shares
MHA Wealth Limited (trading as MHA Wealth)	Cash, Stocks and Shares
Miller & Co Investment Management Limited	Stocks and Shares
Moai Wealth (trading as Moai Wealth Limited)	Stocks and Shares
Mole Valley Asset Management Ltd	Lifetime ISA, Stocks and Shares
Moorfields Advisory Ltd	Innovative Finance ISA
Monmouthshire Building Society	Cash
Monument Bank Limited (trading as Monument Bank)	Cash
Monzo Bank Limited (trading as Monzo)	Cash, Cash Junior ISA, Innovative Finance ISA
Scottish Provident Buildings	Innovative Finance ISA
Morgan Stanley & Co. International plc	Cash, Stocks and Shares
Morningstar Wealth Administration Limited	Stocks and Shares, Stocks and Shares Junior ISA
Multrees Investor Services Limited	Stocks and Shares, Stocks and Shares Junior ISA
National Counties Building Society	Cash
National Deposit Friendly Society Limited	Stocks and Shares
Sanctuary Buildings	Cash
National Westminster Bank plc	Cash, Stocks and Shares
Nationwide Building Society	Cash
Navera Investment Management Limited	Stocks and Shares
The Bloomsbury Building	Stocks and Shares, Stocks and Shares Junior ISA
Newbury Building Society	Cash
Newcastle Building Society	Cash, Lifetime ISA
NFU Mutual Select Investments Limited	Stocks and Shares, Stocks and Shares Junior ISA
Ninety One Fund Managers UK Limited	Cash, Stocks and Shares
Danske Bank	Cash, Stocks and Shares
Nottingham Building Society	Cash, Lifetime ISA
Nottingham Credit Union Limited	Cash
Novia Financial plc (trading as Wealthtime)	Cash, Stocks and Shares
Novia Global Limited	Stocks and Shares
Nucleus Financial Services Limited	Cash, Stocks and Shares
Number One Police Credit Union Limited	Cash
25 Bank Street	Lifetime ISA, Stocks and Shares
Oakglen Wealth Limited	Stocks and Shares, Stocks and Shares Junior ISA
Oaknorth Bank plc	Cash
Oberon Investments Limited	Stocks and Shares
Octopus Investments Limited	Stocks and Shares
OneSavings Bank plc	Cash
Open Access Finance Ltd (trading as Unbolted)	Innovative Finance ISA
Orbis Investments (U.K.) Limited	Stocks and Shares, Stocks and Shares Junior ISA
P1 Investment Services Limited (trading as P1)	Cash, Cash Junior ISA, Stocks and Shares
Paragon Bank plc	Cash, Lifetime ISA
Parmenion Capital Partners LLP	Stocks and Shares, Stocks and Shares Junior ISA
Partners Credit Union Limited	Cash
RW Blears LLP	Innovative Finance ISA
Penny Post Credit Union Limited	Cash
Penrith Building Society	Cash, Cash Junior ISA
Pershing Securities Limited	Stocks and Shares, Stocks and Shares Junior ISA
Philip J Milton & Company plc	Cash, Stocks and Shares, Lifetime ISA
Phoenix Life Limited	Stocks and Shares
Pilling & Co Stockbrokers Ltd	Cash, Stocks and Shares
Plane Saver Credit Union Limited	Cash
Plata Finance Limited	Innovative Finance ISA
Platform One Limited	Innovative Finance ISA, Stocks and Shares
Platform Securities LLP	Lifetime ISA, Stocks and Shares
Police Credit Union Limited	Cash
Premier Fund Managers Limited	Stocks and Shares
Premier Portfolio Managers Limited	Stocks and Shares
Principality Buildings	Cash
Progressive Building Society	Cash
Proplend Limited	Innovative Finance ISA
Prosper Capital LLP	Innovative Finance ISA
Prosper Savings Limited (trading as Prosper)	Cash, Cash Junior ISA, Stocks and Shares
Punjab National Bank (International) Limited	Cash
Quai Investment Services Ltd (trading as Quai Digital)	Cash, Cash Junior ISA, Stocks and Shares
Quilter Cheviot Limited	Stocks and Shares
Quilter Investment Platform Limited	Cash, Stocks and Shares
R C Brown Investment Management plc	Stocks and Shares, Stocks and Shares Junior ISA
Rathbones Investment Management Limited	Stocks and Shares
Rathbones Asset Management Limited	Stocks and Shares
Ravenscroft Investments (UK) Limited	Stocks and Shares
Raymond James Investment Services Ltd	Stocks and Shares
Raymond James Wealth Management Limited	Cash, Stocks and Shares
RBC Europe Limited	Stocks and Shares
RBS Collective Investment Funds Limited	Cash, Stocks and Shares
Rebuildingsociety.com Limited	Innovative Finance ISA
Redmayne-Bentley LLP	Stocks and Shares
Relendex Limited	Innovative Finance ISA
Resolution Compliance Limited	Cash, Innovative Finance ISA, Stocks and Shares
Revolut Trading Ltd	Stocks and Shares
Reyker Securities plc	Cash, Innovative Finance ISA, Stocks and Shares
RLUM Limited	Stocks and Shares
Rockpool Investments LLP	Innovative Finance ISA
Rossie House Investment Management LLP	Stocks and Shares
Rothschild & Co Wealth Management UK Limited	Stocks and Shares
Rowan Dartington & Co Limited	Cash, Stocks and Shares
Royal London Savings Limited	Cash, Stocks and Shares
Royal London Unit Trust Managers Limited	Stocks and Shares
Ruffer LLP	Stocks and Shares
S&T Asset Management LLP	Stocks and Shares
Saffron Building Society	Cash
Saltus Partners LLP (trading as Saltus Investment	Cash, Cash Junior ISA, Stocks and Shares, Lifetime ISA
Santander ISA Managers Limited	Cash, Stocks and Shares
Santander UK plc	Cash
Sarasin & Partners LLP	Stocks and Shares
Sarasin Asset Management Limited	Stocks and Shares
Sarasin Investment Funds Limited	Stocks and Shares
Saveable Limited (trading as Plum Money)	Cash, Cash Junior ISA, Lifetime ISA, Stocks and Shares
40 Bank Street	Stocks and Shares
Schroder & Co Limited	Stocks and Shares
Schroder Unit Trusts Limited	Stocks and Shares
Scottish Building Society	Cash
Scottish Friendly Asset Managers Limited	Cash, Stocks and Shares
Scottish Widows Administration Services Limited	Stocks and Shares
Schroders Personal Wealth Limited	Stocks and Shares, Stocks and Shares Junior ISA
Scottish Widows Unit Trust Managers Limited	Stocks and Shares
Seccl Custody Limited	Stocks and Shares, Stocks and Shares Junior ISA
Secure Trust Bank plc	Cash
Seven Investment Management LLP	Stocks and Shares
Shard Capital Partners LLP	Stocks and Shares
40 Bank Street	Innovative Finance ISA
Share In Ltd	Cash, Stocks and Shares, Innovative Finance ISA
Shawbrook Bank Limited	Cash
Sheffield Mutual Friendly Society Limited	Cash, Stocks and Shares
Shore Capital Stockbrokers Limited	Stocks and Shares
Skipton Building Society	Cash, Lifetime ISA, Cash Junior ISA
Slater Investments Limited	Stocks and Shares, Stocks and Shares Junior ISA
St James's Place Investment Administration Limited	Stocks and Shares
Standard Life Savings Limited	Cash, Stocks and Shares
Starling Bank Ltd (trading as Starling Bank)	Cash
State Bank of India (UK) Limited	Cash, Cash Junior ISA
Stratiphy Limited	Stocks and Shares
Stubben Edge (Risk) Limited	Cash
Suffolk Building Society	Cash
Swansea Building Society	Cash
Synergy Financial Products Limited	Cash, Stocks and Shares
TAM Asset Management Ltd	Cash, Stocks and Shares
Tandem Bank Limited	Cash
Teachers' Building Society	Cash
Titan Pensions & Investments Ltd (trading as Titan	Stocks and Shares, Stocks and Shares Junior ISA
Tembo Savings Limited (trading as Tembo Savings)	Cash, Stocks and Shares, Lifetime ISA
The Ancient Order of Foresters Friendly Society Ltd	Cash, Lifetime ISA, Stocks and Shares
The Charity Bank Limited	Cash
The Chorley and District Building Society	Cash
The Co-operative Bank plc	Cash
The Exeter Practice Ltd	Stocks and Shares
The Mansfield Building Society	Cash
Limited	Cash, Stocks and Shares
The Rechabite Friendly Society Limited	Cash, Stocks and Shares
The Red Rose Friendly Society Limited	Stocks and Shares
The Royal Bank of Scotland plc	Cash, Stocks and Shares
The Royal London Mutual Insurance Society Limited	Stocks and Shares
Haw Bank House	Cash, Stocks and Shares, Lifetime ISA
The Stafford Railway Building Society	Cash
Exchange Buildings	Cash, Stocks and Shares
Third Platform Services Limited	Cash, Cash Junior ISA, Stocks and Shares
Thomas Grant and Company Limited	Cash, Stocks and Shares
Threadneedle Investment Services Limited	Stocks and Shares
Tifosy Limited	Innovative Finance ISA
Tilney Discretionary Portfolio Management Limited	Stocks and Shares, Stocks and Shares Junior ISA
Tipton and Coseley Building Society	Cash
Titan Private Wealth Limited	Stocks and Shares
Titan Settlement & Custody Ltd	Stocks and Shares, Stocks and Shares Junior ISA
Trading 212 UK Limited	Cash, Stocks and Shares
Transport Friendly Society Limited	Cash, Stocks and Shares
TrinityBridge Fund Management Limited	Stocks and Shares
TrinityBridge Limited (trading as TrinityBridge)	Cash, Stocks and Shares
Triodos Bank UK Limited	Cash, Cash Junior ISA, Stocks and Shares
Triple Point Investment Management LLP	Innovative Finance ISA, Stocks and Shares
True Potential Investments LLP	Stocks and Shares
TSB Bank plc	Stocks and Shares
UBS Asset Management Funds Ltd	Stocks and Shares
Unicorn Asset Management Limited	Stocks and Shares
United National Bank Limited	Cash
United Trust Bank Limited	Cash, Stocks and Shares
One Bank Street	Cash, Cash Junior ISA, Stocks and Shares
Upvest Securities Ltd	Cash, Cash Junior ISA, Stocks and Shares
Valu-Trac Investment Management Limited	Cash, Stocks and Shares, Lifetime ISA
The Walbrook Building	Stocks and Shares, Stocks and Shares Junior ISA
Vanquis Bank Limited (trading as Vanquis Bank	Cash
VCAP Capital Ltd (trading as VCAP)	Stocks and Shares, Stocks and Shares Junior ISA
Vernon Building Society	Cash
Verso Investment Management LLP (trading as Verso	Stocks and Shares
Verso Wealth Management Limited	Stocks and Shares, Stocks and Shares Junior ISA
Verus Financial Services Limited	Innovative Finance ISA, Stocks and Shares
Vida Bank Limited (trading as Vida Savings)	Cash
Virgin Money Unit Trust Managers Limited	Stocks and Shares
W H Ireland Limited	Cash, Stocks and Shares
W1M Wealth Management Limited	Stocks and Shares, Stocks and Shares Junior ISA
Walker Crips Investment Management Limited	Cash, Stocks and Shares
Waverton Investment Management Limited	Stocks and Shares
Way Fund Managers Limited	Stocks and Shares
Waystone Financial Investments Limited	Stocks and Shares
Waystone Management (UK) Limited	Stocks and Shares
Wealth at Work Limited	Stocks and Shares
Wealth Club Asset Management Limited	Innovative Finance ISA
Wealthify Limited	Cash, Cash Junior ISA, Stocks and Shares
Wealthkernel Limited	Cash, Cash Junior ISA, Stocks and Shares, Stocks and Shares Junior ISA
WealthTek LLP	Stocks and Shares, Stocks and Shares Junior ISA
Wealthtime Limited	Stocks and Shares
Webull Securities (UK) Limited (trading as Webull UK)	Stocks and Shares
Wesleyan Assurance Society	Stocks and Shares
Wesleyan Unit Trust Managers Limited	Stocks and Shares
West Bromwich Building Society	Cash
Weston Super Mare and District Credit Union Limited	Cash
Whitechurch Securities Limited	Cash, Stocks and Shares
Williams Investment Management LLP	Stocks and Shares
Winterflood Securities Limited	Cash, Stocks and Shares
WiseAlpha Technologies Limited	Innovative Finance ISA
XTB Limited	Cash, Cash Junior ISA, Stocks and Shares
Yealand Fund Services Limited	Stocks and Shares
Yorkshire Building Society	Cash
Zeus Capital Limited	Stocks and Shares, Stocks and Shares Junior ISA
Zopa Bank Limited	Cash, Stocks and Shares`;

function parseComponentsToTypes(components) {
  const types = [];
  const comp = components.toLowerCase();

  // Split by comma to check each component separately
  const parts = comp.split(',').map(p => p.trim());

  parts.forEach(part => {
    // Check for specific ISA types
    if (part === 'cash' || part === 'cash isa') {
      if (!types.includes('Cash ISA')) {
        types.push('Cash ISA');
      }
    } else if (part === 'cash junior isa') {
      if (!types.includes('Cash Junior ISA')) {
        types.push('Cash Junior ISA');
      }
    } else if (part === 'stocks and shares' || part === 'stocks and shares isa' || part === 'stocks & shares') {
      if (!types.includes('Stocks & Shares ISA')) {
        types.push('Stocks & Shares ISA');
      }
    } else if (part === 'stocks and shares junior isa' || part === 'stocks & shares junior isa') {
      if (!types.includes('Stocks & Shares Junior ISA')) {
        types.push('Stocks & Shares Junior ISA');
      }
    } else if (part === 'lifetime isa' || part === 'lifetime') {
      if (!types.includes('Lifetime ISA')) {
        types.push('Lifetime ISA');
      }
    } else if (part === 'innovative finance isa' || part === 'innovative finance') {
      if (!types.includes('Innovative Finance ISA')) {
        types.push('Innovative Finance ISA');
      }
    }
  });

  return types;
}

function determineCategory(name) {
  const lowerName = name.toLowerCase();

  if (lowerName.includes('building society')) {
    return 'building-society';
  }

  if (lowerName.includes('bank') || lowerName.includes(' plc') &&
      (lowerName.includes('bank') || lowerName.includes('lloyds') ||
       lowerName.includes('barclays') || lowerName.includes('hsbc') ||
       lowerName.includes('natwest') || lowerName.includes('santander'))) {
    return 'bank';
  }

  if (lowerName.includes('investment') || lowerName.includes('fund') ||
      lowerName.includes('asset management') || lowerName.includes('securities') ||
      lowerName.includes('wealth') || lowerName.includes('capital')) {
    return 'investment-platform';
  }

  return 'fintech';
}

function cleanName(name) {
  // Remove trading as suffixes
  name = name.replace(/\s*\(trading as.*?\)/gi, '');
  // Clean up common patterns
  name = name.replace(/Limited$/i, '').replace(/Ltd$/i, '').replace(/plc$/i, '');
  name = name.replace(/LLP$/i, '').replace(/\s+$/g, '');
  return name.trim();
}

const lines = rawData.split('\n');
const providers = [];

lines.forEach(line => {
  const parts = line.split('\t');
  if (parts.length === 2) {
    const name = cleanName(parts[0]);
    const components = parts[1];
    const types = parseComponentsToTypes(components);
    const category = determineCategory(name);

    if (types.length > 0 && name.length > 2) {
      providers.push({
        name,
        types,
        category
      });
    }
  }
});

// Sort by name
providers.sort((a, b) => a.name.localeCompare(b.name));

// Output JSON to stdout for file redirection
console.log(JSON.stringify(providers, null, 2));

// Log count to stderr so it doesn't interfere with JSON output
console.error(`Parsed ${providers.length} providers`);
