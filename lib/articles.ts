// Curated newsletter content — recent digital-asset developments with BNY's angle.
// Each article has the full structure: title, date, author, 2-paragraph overview,
// and a 4-part BNY analysis (impact, why it matters, what BNY is doing, implications).

export type Article = {
  id: string;
  title: string;
  date: string;        // ISO date
  author: string;
  overview: string[];  // 2 paragraphs
  analysis: {
    bnyImpact: string;
    whyItMatters: string;
    bnyResponse: string;
    economicImplications: string;
  };
  source: string;
  category: string;
  tag: string;         // short highlight label e.g. "ETFs", "Stablecoins"
  readTime: string;    // e.g. "4 min read"
};

// Fixed publication window so the briefing reads as a coherent daily edition.
const EDITION = "2026-08-04T07:00:00.000Z";

export const MARKET_BRIEFING: Article[] = [
  {
    id: "mb-1",
    title: "Spot Bitcoin ETFs Absorb Record Weekly Inflows as Institutional Allocation Deepens",
    date: EDITION,
    author: "BNY Digital Assets Strategy Desk",
    overview: [
      "U.S. spot Bitcoin ETFs drew their largest weekly net inflow on record last week, with the iShares Bitcoin Trust (IBIT) and Fidelity Wise Origin Bitcoin Fund (FBTC) together accounting for the bulk of demand. The flow surge coincided with Bitcoin reclaiming the mid-$60,000 range, as allocators rebalanced ahead of the month-end and macro catalysts including Treasury supply and labor-market data.",
      "The sustained pace of ETF adoption has compressed the historical discount between on-exchange and OTC Bitcoin liquidity, with market makers reporting tighter spreads and deeper order books during U.S. hours. Analysts note that the composition of buyers has broadened beyond hedge funds to include pension allocations and model-portfolio platforms, a structural shift in the demand base.",
    ],
    analysis: {
      bnyImpact: "BNY acts as the authorized participant custodian and fund-services provider for several spot Bitcoin ETFs, meaning that inflow cycles translate directly into assets under custody and administration. Each creation basket increases the notional BNY safeguards and the corresponding servicing, transfer-agent, and reconciliation workload.",
      whyItMatters: "ETF AUC is among the stickiest and highest-quality revenue streams in asset servicing — once a fund is onboarded, switching costs are prohibitive. The broadening buyer base toward pensions and models signals that Bitcoin allocation is becoming structural rather than tactical, which compounds BNY's fee base over multi-year horizons.",
      bnyResponse: "BNY continues to invest in the operational infrastructure supporting ETF creation/redemption at scale, including real-time reconciliation across on-chain and traditional bookkeeping systems. Its digital-asset custody platform is integrated with the firm's broader fund-administration stack, giving issuers a single servicing relationship rather than a patchwork of providers.",
      economicImplications: "The channeling of institutional capital into Bitcoin via regulated wrappers reinforces the integration of digital assets into conventional portfolio construction. As ETF AUM grows, it increases structural demand for the underlying and reshapes intraday Treasury and repo flows used to fund creations.",
    },
    source: "BNY Digital Assets Strategy",
    category: "ETFs",
    tag: "Flows",
    readTime: "4 min read",
  },
  {
    id: "mb-2",
    title: "Stablecoin Reserves Reshape Treasury Demand as GENIUS Act Framework Takes Hold",
    date: "2026-07-29T07:00:00.000Z",
    author: "BNY Rates & Collateral Desk",
    overview: [
      "Following the passage of the GENIUS Act, payment stablecoin issuers have accelerated compliance with the law's reserve requirements, which mandate backing by high-quality liquid assets — predominantly U.S. Treasury bills and cash held in segregated accounts. Industry estimates suggest stablecoin reserves now represent a meaningful and growing share of outstanding short-dated T-bills.",
      "The compliance transition has prompted issuers to formalize custodial arrangements with regulated banks, with monthly audit requirements driving demand for segregated-account infrastructure and collateral reporting. The framework has also clarified the supervisory perimeter, distinguishing federally regulated issuers from state-level pathways.",
    ],
    analysis: {
      bnyImpact: "BNY is positioned as a custodian for stablecoin reserve assets, particularly Treasury collateral, and as a collateral-management provider supporting the segregation and reporting mandates. Each compliant issuer onboarded expands BNY's collateral book and the associated servicing and reporting fees.",
      whyItMatters: "Stablecoin reserves are becoming a structural source of demand for short-dated Treasuries, creating a durable linkage between digital-asset growth and the government securities market in which BNY is a dominant infrastructure operator. Owning this flow reinforces BNY's role at the intersection of TradFi and digital dollars.",
      bnyResponse: "BNY has extended its tri-party collateral infrastructure to support stablecoin reserve segregation, offering issuers integrated custody, daily reconciliation, and the audit trails required under the new framework. Its existing scale in Treasury settlement gives it an operational cost advantage as the reserve base grows.",
      economicImplications: "The institutionalization of stablecoin reserves could materially increase marginal demand for T-bills, influencing short-end funding dynamics and repo market structure. It also further dollarizes global digital payments, extending the reach of U.S. monetary instruments through tokenized rails.",
    },
    source: "BNY Rates & Collateral",
    category: "Stablecoins",
    tag: "Regulation",
    readTime: "5 min read",
  },
  {
    id: "mb-3",
    title: "BlackRock, Fidelity Push to Enable Staking in Spot Ethereum ETFs",
    date: "2026-07-22T07:00:00.000Z",
    author: "BNY Digital Assets Research",
    overview: [
      "Filings from BlackRock and Fidelity to permit staking within their spot Ethereum ETFs (ETHA and FETH, respectively) remain under SEC review, with the proposals seeking both staking authorization and in-kind creation/redemption. If approved, the amendments would allow the funds to earn yield — currently in the 2-3% annual range — on a portion of their ETH holdings for the first time.",
      "The filings represent a reversal of the SEC's original 2024 stance that required staking to be disabled as a condition of approval. Industry participants expect a decision during the current review window, with implementation potentially following in the back half of the year. A favorable outcome is widely seen as a catalyst for fresh ETF inflows.",
    ],
    analysis: {
      bnyImpact: "BNY's custody and fund-services relationships with major ETF issuers mean that staking-enabled products would require new operational workflows around staking execution, reward accounting, and slash-risk management — all of which expand the servicing scope BNY can provide.",
      whyItMatters: "Yield-bearing ETF wrappers materially improve the competitive profile of Ethereum exposure versus direct holding, likely accelerating institutional adoption. For BNY, each new product variant (staking, in-kind) adds complexity that issuers prefer to outsource to a scaled servicer, deepening the relationship.",
      bnyResponse: "BNY has been building staking-adjacent capabilities — including reward reconciliation, validator risk monitoring, and integration with on-chain staking data — to be ready to service staking-enabled funds from day one of approval. Its digital custody platform is designed to support yield-bearing digital-asset positions.",
      economicImplications: "Institutionalized staking at ETF scale would lock a meaningful share of Ethereum supply, potentially compressing liquid float and influencing staking yield rates economy-wide. It also formalizes proof-of-stake yield as a recognized component of regulated fund returns.",
    },
    source: "BNY Digital Assets Research",
    category: "Staking",
    tag: "ETFs",
    readTime: "4 min read",
  },
  {
    id: "mb-4",
    title: "Tokenized Money-Market Funds Cross New AUM Threshold as Issuers Scale",
    date: "2026-07-18T07:00:00.000Z",
    author: "BNY Tokenization Strategy",
    overview: [
      "Tokenized money-market fund products surpassed a new assets-under-management milestone this month, as issuers including BlackRock (BUIDL), Franklin Templeton (BENJI), and Ondo Finance continued to expand issuance across multiple blockchains. The funds offer same-day settlement and programmable redemption, features that are drawing corporate treasury and institutional cash-management use cases.",
      "Growth has been concentrated in products backed by T-bills and repo, creating a direct link between on-chain fund structures and the traditional government securities market. Issuers report that demand is increasingly driven by operational efficiency — intraday liquidity and 24/7 settlement — rather than speculative positioning.",
    ],
    analysis: {
      bnyImpact: "BNY provides custody, fund administration, and transfer-agent services to several tokenized money-market funds, meaning AUM growth in this category flows directly through its servicing franchise. The on-chain settlement layer also interacts with BNY's collateral and payments infrastructure.",
      whyItMatters: "Tokenized funds represent the most concrete convergence of digital-asset technology with BNY's core competencies — fund servicing, Treasury settlement, and collateral management. Winning share in this category early is strategically valuable because the operating model becomes the template for broader tokenized asset classes.",
      bnyResponse: "BNY has integrated tokenized fund servicing into its platform, supporting multi-chain recordkeeping, automated corporate actions, and reconciliation between on-chain token balances and traditional fund accounting. Its scale in Treasury settlement gives it a structural cost advantage as these funds scale.",
      economicImplications: "The growth of tokenized T-bill funds creates a new, programmable channel for short-term government debt distribution, potentially improving price discovery and settlement efficiency in money markets. It also introduces 24/7 dollar liquidity that could reshape intraday treasury management.",
    },
    source: "BNY Tokenization Strategy",
    category: "Tokenization",
    tag: "MMFs",
    readTime: "5 min read",
  },
  {
    id: "mb-5",
    title: "Solana Spot ETF Approvals Advance as SEC Concludes Review",
    date: "2026-07-15T07:00:00.000Z",
    author: "BNY Digital Assets Strategy Desk",
    overview: [
      "The SEC concluded its review of spot Solana ETF proposals, advancing the products toward final approval and trading. Filings from issuers including VanEck, 21Shares, and Canary Capital progressed through the 19b-4 process, with market participants anticipating launches following the final registration statement effectiveness.",
      "Solana's high-throughput, low-cost architecture has positioned it as a favored settlement layer for payments and consumer applications, and the ETF approvals broaden institutional access to the asset beyond Bitcoin and Ethereum. Issuers expect demand from allocators seeking diversified digital-asset exposure within regulated wrappers.",
    ],
    analysis: {
      bnyImpact: "Each new spot crypto ETF that launches represents a potential custody and fund-services mandate for BNY. Solana ETFs introduce a third major digital-asset custody line alongside Bitcoin and Ethereum, expanding the scope of assets BNY safeguards and services.",
      whyItMatters: "Broadening the ETF universe beyond Bitcoin and Ethereum deepens the institutional digital-asset market and increases the total addressable servicing opportunity. For BNY, multi-asset custody capability is a differentiator — issuers prefer a single servicer across their entire crypto ETF complex.",
      bnyResponse: "BNY's digital custody platform is architected to support multiple blockchain protocols, and the firm has been building Solana-specific custody and key-management capabilities in anticipation of institutional-grade products. Its fund-services stack is asset-agnostic, allowing rapid onboarding of new ETF launches.",
      economicImplications: "The approval of Solana ETFs signals regulatory maturation beyond the two largest crypto assets, potentially accelerating the institutionalization of a broader set of protocols. It also expands the range of collateral types and settlement rails interacting with traditional financial infrastructure.",
    },
    source: "BNY Digital Assets Strategy",
    category: "ETFs",
    tag: "Solana",
    readTime: "4 min read",
  },
  {
    id: "mb-6",
    title: "BNY Expands Digital Custody to Support XRP Amid Broadening Asset Coverage",
    date: "2026-07-11T07:00:00.000Z",
    author: "BNY Digital Assets Operations",
    overview: [
      "BNY expanded its digital-asset custody platform to support XRP, broadening the range of cryptocurrencies it can hold on behalf of institutional clients. The addition reflects growing client demand for diversified digital-asset exposure and follows the firm's established pattern of extending coverage as regulatory clarity and institutional demand emerge.",
      "The expansion aligns with a broader industry trend of legacy custody banks scaling multi-asset digital capabilities, as asset managers and corporate treasuries seek single-provider solutions across an increasingly diverse cryptocurrency universe. XRP's role in cross-border payments was cited as a relevant use case for institutional interest.",
    ],
    analysis: {
      bnyImpact: "Adding XRP custody directly expands the set of assets BNY can service for existing and prospective clients, increasing the wallet share capturable within a single relationship. Each supported asset deepens the platform's appeal to multi-strategy digital-asset investors.",
      whyItMatters: "Custody breadth is a key competitive vector — clients prefer to consolidate holdings with a single regulated provider rather than fragment across specialists. BNY's ability to offer custody across Bitcoin, Ethereum, XRP, and tokenized funds positions it as a comprehensive digital-asset servicing platform.",
      bnyResponse: "BNY continues to extend its custody platform on an asset-by-asset basis, prioritizing additions where institutional demand and regulatory clarity align. The XRP rollout leverages the same secure key-management infrastructure and integrated fund-accounting stack that supports its other digital-asset holdings.",
      economicImplications: "The institutionalization of XRP custody reflects the maturing of cross-border payment rails and the convergence of digital-asset infrastructure with correspondent banking. As custody banks support more assets, the plumbing for institutional digital-asset markets becomes more robust and regulated.",
    },
    source: "BNY Digital Assets Operations",
    category: "Custody",
    tag: "XRP",
    readTime: "3 min read",
  },
];

export const CLIENTS_AND_COMPETITORS: Article[] = [
  {
    id: "cc-1",
    title: "BlackRock BUIDL Tokenized Fund Continues Lead as Tokenization AUM Grows",
    date: "2026-07-28T07:00:00.000Z",
    author: "BNY Client Intelligence",
    overview: [
      "BlackRock's BUIDL tokenized money-market fund maintained its position as the largest tokenized fund by AUM, continuing to draw institutional allocations seeking on-chain T-bill exposure with same-day settlement. The fund's growth has been a bellwether for the broader tokenization market, which is tracking toward multi-billion-dollar issuance across issuers.",
      "As a major BNY custody and fund-administration client, BlackRock's expansion in tokenized products reinforces the strategic importance of the relationship. BlackRock has emphasized operational efficiency and multi-chain distribution as key differentiators for its tokenized fund complex.",
    ],
    analysis: {
      bnyImpact: "BlackRock is among BNY's largest custody and fund-administration clients, and the growth of BUIDL translates directly into servicing revenue and on-chain reconciliation activity. The tokenized fund structure also leverages BNY's Treasury settlement and collateral infrastructure.",
      whyItMatters: "BlackRock's leadership in tokenization establishes a template that other issuers follow, and BNY's role as servicer to the category leader reinforces its own positioning. Deep integration with a marquee client creates a moat — the operational complexity of tokenized funds makes switching providers costly.",
      bnyResponse: "BNY deepens its integration with BlackRock's tokenized products through bundled custody, fund administration, and transfer-agent services, supported by real-time reconciliation between on-chain balances and traditional fund accounting.",
      economicImplications: "The scaling of tokenized money-market funds creates a programmable channel for short-term government debt distribution, improving settlement efficiency and potentially reshaping intraday dollar liquidity management.",
    },
    source: "BNY Client Intelligence",
    category: "Client",
    tag: "BlackRock",
    readTime: "4 min read",
  },
  {
    id: "cc-2",
    title: "State Street Accelerates Digital Asset Custody Build-Out",
    date: "2026-07-24T07:00:00.000Z",
    author: "BNY Competitive Intelligence",
    overview: [
      "State Street continued to accelerate investment in its digital-asset custody and tokenization capabilities, signaling a sharper competitive posture against BNY in the institutional digital-asset servicing market. The build-out includes platform enhancements for multi-asset custody and integrated fund servicing for tokenized products.",
      "State Street's push comes as the competitive landscape for digital custody concentrates among the largest trust banks, each racing to offer institutional-grade rails for crypto and tokenized assets. The bank's positioning directly contests BNY's leadership in custody and asset servicing.",
    ],
    analysis: {
      bnyImpact: "State Street is BNY's closest peer in custody and asset servicing, and its digital-asset build-out directly contests BNY's market share in the highest-growth segment of the custody market. Mandates won by State Street are mandates not captured by BNY.",
      whyItMatters: "Digital-asset servicing is a strategic frontier where early scale confers network effects. The winner of the next cohort of institutional mandates will compound advantages over time as tokenized assets and on-chain settlement become mainstream infrastructure.",
      bnyResponse: "BNY counters with its integrated platform spanning custody, collateral, fund administration, and Treasury settlement — a broader scope than custody alone. Its live digital custody platform and existing multi-asset coverage give it a time-to-market advantage.",
      economicImplications: "Competition among trust banks for digital-asset custody is driving down fees and accelerating platform investment, benefiting institutional clients. The concentration of custody among regulated banks reinforces the institutionalization of digital assets.",
    },
    source: "BNY Competitive Intelligence",
    category: "Competitor",
    tag: "State Street",
    readTime: "4 min read",
  },
  {
    id: "cc-3",
    title: "Franklin Templeton Extends Tokenized BENJI Fund to Additional Blockchains",
    date: "2026-07-19T07:00:00.000Z",
    author: "BNY Client Intelligence",
    overview: [
      "Franklin Templeton expanded distribution of its BENJI tokenized money-market fund to additional blockchains, broadening the settlement options available to institutional investors. The multi-chain approach reflects issuer demand for flexibility in where tokenized fund positions are recorded and redeemed.",
      "As an existing BNY servicing client, Franklin Templeton's tokenization expansion flows through to BNY's fund-administration and custody operations. The growth of BENJI reinforces the trend of traditional asset managers operationalizing tokenized fund structures at scale.",
    ],
    analysis: {
      bnyImpact: "Franklin Templeton's tokenized fund expansion increases the assets BNY services on its behalf and adds multi-chain reconciliation complexity that BNY is positioned to absorb. Each new chain integration expands the servicing scope and corresponding fees.",
      whyItMatters: "Multi-chain distribution is becoming a baseline expectation for tokenized funds, and BNY's ability to support reconciliation across chains is a differentiator. Servicing clients through their chain-expansion journey deepens the relationship and raises switching costs.",
      bnyResponse: "BNY supports multi-chain recordkeeping and reconciliation for tokenized funds, allowing clients like Franklin Templeton to expand distribution without re-platforming their servicing relationship.",
      economicImplications: "Multi-chain tokenized fund distribution increases the interoperability of on-chain financial infrastructure, reducing single-chain dependency risk and improving market resilience.",
    },
    source: "BNY Client Intelligence",
    category: "Client",
    tag: "Franklin Templeton",
    readTime: "3 min read",
  },
  {
    id: "cc-4",
    title: "JPMorgan Onyx Tokenization Platform Targets Collateral Mobility",
    date: "2026-07-14T07:00:00.000Z",
    author: "BNY Competitive Intelligence",
    overview: [
      "JPMorgan continued to develop its Onyx tokenization platform with a focus on collateral mobility, enabling clients to move tokenized collateral across accounts and venues in near real-time. The platform competes with BNY's collateral-management infrastructure in the institutional market.",
      "JPMorgan's approach leverages its balance sheet and banking relationships to offer integrated collateral and payments solutions, positioning Onyx as a platform for institutional on-chain treasury and collateral management.",
    ],
    analysis: {
      bnyImpact: "JPMorgan competes with BNY's collateral-management franchise, and its tokenization platform targets the same intraday liquidity and collateral-mobility use cases. The competitive overlap is most acute in tri-party collateral and securities lending.",
      whyItMatters: "Collateral mobility is a high-value infrastructure layer — owning the rails for tokenized collateral movement positions the winner at the center of institutional digital-asset operations. BNY's existing tri-party scale is a counterweight to JPMorgan's platform investment.",
      bnyResponse: "BNY is investing in real-time collateral mobility within its own tri-party platform, leveraging its dominant market share in collateral agency services. Its collateral infrastructure is being extended to support tokenized assets natively.",
      economicImplications: "Tokenized collateral mobility could materially reduce settlement friction and intraday liquidity needs, improving capital efficiency across the financial system and reshaping repo market structure.",
    },
    source: "BNY Competitive Intelligence",
    category: "Competitor",
    tag: "JPMorgan",
    readTime: "4 min read",
  },
  {
    id: "cc-5",
    title: "Ondo Finance Partners with Traditional Custodians for Tokenized T-Bill Products",
    date: "2026-07-09T07:00:00.000Z",
    author: "BNY Client Intelligence",
    overview: [
      "Ondo Finance, a native-digital issuer of tokenized Treasury products, expanded partnerships with traditional custodians and servicers to support institutional adoption of its USDY and OUSG products. The partnerships reflect a convergence between native-digital issuers and regulated financial infrastructure.",
      "Ondo's growth signals that tokenized T-bill products are attracting demand beyond crypto-native users, with traditional allocators seeking regulated custody and servicing for on-chain government debt exposure. The trend creates opportunities for incumbents positioned to service new issuer segments.",
    ],
    analysis: {
      bnyImpact: "Native-digital issuers like Ondo represent a new client segment for BNY's custody and fund-administration services. As these issuers seek institutional-grade servicing to attract traditional allocators, BNY is positioned to onboard them onto its regulated platform.",
      whyItMatters: "Servicing native-digital issuers bridges the gap between crypto-native innovation and regulated finance, a positioning that reinforces BNY's role as the institutional infrastructure layer for digital assets. Early relationships with emerging issuers can compound as they scale.",
      bnyResponse: "BNY is building onboarding paths for native-digital issuers, offering the same custody, fund administration, and Treasury-settlement infrastructure it provides traditional asset managers. This allows issuers like Ondo to attract institutional capital with regulated servicing.",
      economicImplications: "The convergence of native-digital and traditional issuers in tokenized T-bill markets increases competition and innovation, accelerating the institutionalization of on-chain government debt products.",
    },
    source: "BNY Client Intelligence",
    category: "Client",
    tag: "Ondo Finance",
    readTime: "3 min read",
  },
];

export const NEWSLETTER = {
  edition: EDITION,
  marketBriefing: MARKET_BRIEFING,
  clientsAndCompetitors: CLIENTS_AND_COMPETITORS,
};
