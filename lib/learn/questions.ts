export const MODULE_CONTENT: Record<string, any> = {
  'module-1': {
    title: 'Basic Fundamentals',
    lesson: `Understanding financial fundamentals is crucial for analyzing any company. Let's explore the key metrics that investors use to evaluate businesses.

**P/E Ratio (Price-to-Earnings)**: This shows how much investors are willing to pay per dollar of earnings. A P/E of 25 means investors pay $25 for every $1 of annual earnings. Higher P/E ratios often indicate growth expectations, but can also signal overvaluation.

**EBITDA**: Earnings Before Interest, Taxes, Depreciation, and Amortization. This measures a company's operating profitability before accounting decisions and tax structures affect the numbers. It's useful for comparing companies across different tax jurisdictions.

**ROE (Return on Equity)**: Shows how efficiently a company uses shareholder equity to generate profits. ROE = Net Income / Shareholder Equity. A higher ROE generally indicates better management efficiency.

**D/E Ratio (Debt-to-Equity)**: Measures financial leverage by comparing total debt to shareholder equity. High D/E ratios can indicate higher risk but also potential for higher returns.

**Key Insight**: No single metric tells the whole story. Analysts compare multiple metrics and consider industry context, growth trends, and competitive positioning.`,
    questions: [
      { id: 1, type: 'mcq', question: 'If Company A has a P/E ratio of 35 and Company B has a P/E ratio of 15, what does this typically suggest?', options: [{ label: 'A', text: 'Company A is cheaper than Company B' }, { label: 'B', text: 'Investors expect higher growth from Company A' }, { label: 'C', text: 'Company B is more profitable than Company A' }, { label: 'D', text: 'Company A has more debt than Company B' }], correctAnswer: 'B', explanation: 'A higher P/E ratio typically indicates that investors expect higher future growth from the company, making them willing to pay more per dollar of current earnings.' },
      { id: 2, type: 'mcq', question: 'EBITDA is useful for comparing companies because it:', options: [{ label: 'A', text: 'Includes all expenses to show true profitability' }, { label: 'B', text: 'Eliminates the impact of different tax structures and accounting methods' }, { label: 'C', text: 'Shows cash flow directly' }, { label: 'D', text: 'Is always higher than net income' }], correctAnswer: 'B', explanation: 'EBITDA removes interest, taxes, depreciation, and amortization, making it easier to compare operating profitability across companies with different capital structures and tax situations.' },
      { id: 3, type: 'mcq', question: 'A company with a ROE of 25% and a D/E ratio of 0.5 is likely:', options: [{ label: 'A', text: 'Highly leveraged and risky' }, { label: 'B', text: 'Efficiently using equity with moderate leverage' }, { label: 'C', text: 'Not using debt effectively' }, { label: 'D', text: 'Overvalued' }], correctAnswer: 'B', explanation: 'A ROE of 25% indicates strong profitability, while a D/E of 0.5 shows moderate, manageable leverage. This combination suggests efficient use of both equity and debt.' },
      { id: 4, type: 'mcq', question: 'Which statement about P/E ratios is FALSE?', options: [{ label: 'A', text: 'P/E ratios should be compared within the same industry' }, { label: 'B', text: 'A high P/E always means a stock is overvalued' }, { label: 'C', text: 'P/E ratios can vary based on growth expectations' }, { label: 'D', text: 'Negative P/E ratios indicate the company is losing money' }], correctAnswer: 'B', explanation: 'A high P/E ratio doesn\'t always mean overvaluation. It could reflect strong growth prospects, competitive advantages, or market confidence. Context and comparison to peers are essential.' },
      { id: 5, type: 'mcq', question: 'What does a D/E ratio of 2.0 indicate?', options: [{ label: 'A', text: 'The company has twice as much equity as debt' }, { label: 'B', text: 'The company has twice as much debt as equity' }, { label: 'C', text: 'The company has equal debt and equity' }, { label: 'D', text: 'The company has no debt' }], correctAnswer: 'B', explanation: 'A D/E ratio of 2.0 means the company has $2 of debt for every $1 of equity, indicating higher leverage and potentially higher financial risk.' },
      { id: 6, type: 'written', question: 'Explain the relationship between ROE, ROA, and financial leverage. How does debt affect these ratios? Use your selected company as an example to illustrate these concepts.', guidance: 'Describe how ROE = ROA × Equity Multiplier, and explain how using debt can amplify returns but also increase risk. Use your selected company\'s actual metrics as examples.' },
      { id: 7, type: 'written', question: 'Analyze the financial metrics for your selected company. Discuss their P/E ratio, profitability metrics (ROE/ROA), and debt levels. Are these metrics attractive for investment? Consider both the absolute values and what they suggest about the company\'s financial health.', guidance: 'Your answer should cite specific numbers from your selected company, compare them to reasonable benchmarks, and explain what these metrics reveal about the company\'s valuation, profitability, and risk profile.' }
    ]
  },
  'module-2': {
    title: '10-K: Business & Risk Factors',
    lesson: `The Business Description and Risk Factors sections of a 10-K report provide crucial qualitative information about a company.

**Business Description Section**: This describes what the company does, its products/services, target markets, competitive advantages, and business model. Look for:
- Revenue streams and their relative importance
- Competitive positioning and market share
- Key partnerships and distribution channels
- Growth strategies and market opportunities

**Risk Factors Section**: Companies must disclose material risks that could affect their business. Common risks include:
- **Competition risks**: New entrants, pricing pressure, loss of market share
- **Regulatory risks**: Changing laws, compliance costs, potential fines
- **Operational risks**: Supply chain disruptions, key customer concentration
- **Market risks**: Economic downturns, currency fluctuations, interest rates

**Critical Analysis**: Don't just read the risks - evaluate their likelihood and potential impact. Compare how companies in the same industry describe similar risks. More specific, detailed risk disclosures often indicate better management awareness.`,
    questions: [
      { id: 1, type: 'mcq', question: 'When analyzing risk factors in a 10-K, which approach provides the most valuable insight?', options: [{ label: 'A', text: 'Counting the total number of risk factors listed' }, { label: 'B', text: 'Evaluating the specificity and severity of disclosed risks' }, { label: 'C', text: 'Only focusing on financial risks' }, { label: 'D', text: 'Assuming all risks are equally important' }], correctAnswer: 'B', explanation: 'The quality and specificity of risk disclosures matter more than quantity. Detailed, specific risks indicate management is aware of real challenges, while generic risks may hide important issues.' },
      { id: 2, type: 'mcq', question: 'A company\'s business description section should help you understand:', options: [{ label: 'A', text: 'Only what products they sell' }, { label: 'B', text: 'Revenue streams, competitive position, and business model' }, { label: 'C', text: 'Only their financial performance' }, { label: 'D', text: 'Only their future plans' }], correctAnswer: 'B', explanation: 'The business description provides comprehensive information about how the company makes money, its competitive advantages, market position, and overall business strategy.' },
      { id: 3, type: 'mcq', question: 'Which type of risk is LEAST likely to be disclosed in a 10-K?', options: [{ label: 'A', text: 'Regulatory risks from changing laws' }, { label: 'B', text: 'Competition from new market entrants' }, { label: 'C', text: 'Specific future product launch dates' }, { label: 'D', text: 'Supply chain disruptions' }], correctAnswer: 'C', explanation: 'Companies disclose risks but typically don\'t reveal specific future product launch dates in risk factors, as this is forward-looking information that could be considered material non-public information.' },
      { id: 4, type: 'mcq', question: 'A company that provides very generic, boilerplate risk factors is likely:', options: [{ label: 'A', text: 'Very safe with no real risks' }, { label: 'B', text: 'Either hiding real risks or not properly analyzing them' }, { label: 'C', text: 'Following best practices' }, { label: 'D', text: 'Required by law to be vague' }], correctAnswer: 'B', explanation: 'Generic risk factors may indicate poor risk management or an attempt to hide specific vulnerabilities. Well-managed companies typically provide detailed, specific risk disclosures.' },
      { id: 5, type: 'mcq', question: 'When evaluating competitive risks, you should look for:', options: [{ label: 'A', text: 'Only the number of competitors mentioned' }, { label: 'B', text: 'Specific competitive threats, market share trends, and pricing pressures' }, { label: 'C', text: 'Only positive statements about competition' }, { label: 'D', text: 'Only financial metrics' }], correctAnswer: 'B', explanation: 'Effective competitive risk analysis requires understanding specific threats, market dynamics, pricing pressures, and how the company positions itself against competitors.' },
      { id: 6, type: 'written', question: 'Compare the risk factors section of your selected company to a competitor. What differences do you notice in how they describe similar risks? What does this tell you about each company\'s risk management?', guidance: 'Focus on how specific and detailed each company is in describing risks. Consider whether one company seems more aware of challenges or better at communicating them. Make sure to clearly identify your selected company and the competitor you\'re comparing it to.' },
      { id: 7, type: 'written', question: 'Based on the business description and risk factors for your selected company, evaluate their competitive position and major risks. Identify the top 3 risks and assess whether management has competitive advantages that might mitigate these risks.', guidance: 'Cite specific details from your selected company\'s business description and risk factors. Explain why certain risks are more significant than others and how the company\'s business model addresses or is vulnerable to these risks.' }
    ]
  },
  'module-3': {
    title: '10-K: Financial Statements',
    lesson: `Financial statements are the quantitative heart of a 10-K report. Three core statements work together to show a company's financial health.

**Balance Sheet**: Shows what a company owns (assets), owes (liabilities), and the difference (equity) at a specific point in time.
- Current Ratio = Current Assets / Current Liabilities (measures short-term liquidity)
- Look for trends in working capital and debt levels

**Income Statement**: Shows revenue, expenses, and profit over a period.
- Gross Margin = (Revenue - COGS) / Revenue (shows pricing power)
- Operating Margin = Operating Income / Revenue (shows operational efficiency)
- Track revenue growth and margin trends

**Cash Flow Statement**: Shows actual cash movements, which can differ from accounting profits.
- Operating Cash Flow shows cash from core business
- Free Cash Flow = Operating Cash Flow - CapEx (cash available after investments)
- Healthy companies generate consistent positive operating cash flow

**Key Analysis Points**:
- Revenue growth alone isn't enough - check if it's profitable growth
- Compare margins to competitors to assess competitive position
- Cash flow is harder to manipulate than accounting earnings
- Look for discrepancies between profits and cash flow`,
    questions: [
      { id: 1, type: 'mcq', question: 'A company reports strong net income growth but declining operating cash flow. What is the most likely explanation?', options: [{ label: 'A', text: 'The company is very profitable' }, { label: 'B', text: 'Revenue growth is being driven by extended credit terms' }, { label: 'C', text: 'The company has too much cash' }, { label: 'D', text: 'Operating expenses are too low' }], correctAnswer: 'B', explanation: 'When earnings grow but cash flow declines, it often indicates aggressive revenue recognition, extended payment terms to customers, or inventory buildup - all concerning signs about quality of earnings.' },
      { id: 2, type: 'mcq', question: 'The balance sheet shows:', options: [{ label: 'A', text: 'A company\'s financial position at a specific point in time' }, { label: 'B', text: 'Revenue and expenses over a period' }, { label: 'C', text: 'Cash movements over time' }, { label: 'D', text: 'Only assets' }], correctAnswer: 'A', explanation: 'The balance sheet is a snapshot showing assets, liabilities, and equity at a specific date, while income and cash flow statements show changes over time periods.' },
      { id: 3, type: 'mcq', question: 'A current ratio of 0.8 indicates:', options: [{ label: 'A', text: 'The company has strong liquidity' }, { label: 'B', text: 'The company may struggle to pay short-term obligations' }, { label: 'C', text: 'The company has no current liabilities' }, { label: 'D', text: 'The company is highly profitable' }], correctAnswer: 'B', explanation: 'A current ratio below 1.0 means current liabilities exceed current assets, indicating potential liquidity problems and difficulty meeting short-term obligations.' },
      { id: 4, type: 'mcq', question: 'Free Cash Flow is calculated as:', options: [{ label: 'A', text: 'Operating Cash Flow - Capital Expenditures' }, { label: 'B', text: 'Net Income - Dividends' }, { label: 'C', text: 'Revenue - Expenses' }, { label: 'D', text: 'Total Cash - Total Debt' }], correctAnswer: 'A', explanation: 'Free Cash Flow represents cash available after maintaining or expanding asset base. It\'s Operating Cash Flow minus Capital Expenditures, showing cash available for dividends, buybacks, or debt reduction.' },
      { id: 5, type: 'mcq', question: 'If gross margin is declining while revenue is growing, this suggests:', options: [{ label: 'A', text: 'The company is becoming more efficient' }, { label: 'B', text: 'Pricing pressure or rising costs are squeezing profitability' }, { label: 'C', text: 'The company has no competition' }, { label: 'D', text: 'The company is gaining market share' }], correctAnswer: 'B', explanation: 'Declining gross margins typically indicate competitive pricing pressure, rising input costs, or a shift to lower-margin products, even if revenue is growing.' },
      { id: 6, type: 'mcq', question: 'Which statement about the income statement is TRUE?', options: [{ label: 'A', text: 'It shows cash movements' }, { label: 'B', text: 'It uses accrual accounting, so revenue may not equal cash received' }, { label: 'C', text: 'It only shows assets and liabilities' }, { label: 'D', text: 'It is always the same as cash flow' }], correctAnswer: 'B', explanation: 'The income statement uses accrual accounting, recognizing revenue when earned (not necessarily when cash is received) and expenses when incurred, which can differ significantly from actual cash flows.' },
      { id: 7, type: 'written', question: 'Explain the difference between operating cash flow and free cash flow. Why is free cash flow important for investors? Use your selected company\'s financial statements to illustrate these concepts.', guidance: 'Describe what each metric represents, how they differ, and why free cash flow is a key indicator of a company\'s financial health and ability to return value to shareholders. Reference your selected company\'s actual cash flow data.' },
      { id: 8, type: 'written', question: 'Analyze your selected company\'s financial statements. Evaluate their revenue growth, profitability margins (gross and operating), and cash flow generation. Is the company generating profitable growth? Are there any concerning trends in the relationships between revenue, profit, and cash flow?', guidance: 'Use specific numbers and percentages. Compare margins to prior periods and industry averages if possible. Discuss whether the business model generates strong cash conversion from profits.' }
    ]
  },
  'module-4': {
    title: 'Competitive Analysis & Moats',
    lesson: `A company's competitive advantages ("moats") determine its ability to maintain profitability over time.

**Types of Economic Moats**:

1. **Network Effects**: Product becomes more valuable as more people use it (e.g., social media, payment networks)
2. **Switching Costs**: High cost or difficulty for customers to switch to competitors (e.g., enterprise software, bank accounts)
3. **Cost Advantages**: Ability to produce at lower cost than competitors (e.g., scale economies, proprietary technology)
4. **Intangible Assets**: Brand power, patents, regulatory licenses that competitors can't easily replicate
5. **Scale Economies**: Lower per-unit costs as volume increases

**Evaluating Moat Strength**:
- Stable or expanding profit margins over 5-10 years
- High returns on invested capital (ROIC > 15%)
- Pricing power (ability to raise prices without losing customers)
- Market share trends in core markets
- Barriers to entry for new competitors

**Competitive Risks**:
- Technology disruption
- Changing customer preferences
- Regulatory changes
- Market saturation
- Competitors' responses

**Analysis Framework**: A sustainable competitive advantage should explain why the company maintains high returns despite competition. Look for evidence in financial metrics, not just management claims.`,
    questions: [
      { id: 1, type: 'mcq', question: 'Which metric is the best indicator that a company has a durable competitive advantage?', options: [{ label: 'A', text: 'High revenue growth in the most recent quarter' }, { label: 'B', text: 'Consistently high return on invested capital over 10+ years' }, { label: 'C', text: 'Large market capitalization' }, { label: 'D', text: 'Low employee turnover' }], correctAnswer: 'B', explanation: 'Consistently high ROIC over many years indicates the company can generate strong returns despite competition, suggesting a durable competitive advantage. Short-term metrics or size alone don\'t prove sustainable advantages.' },
      { id: 2, type: 'mcq', question: 'Network effects occur when:', options: [{ label: 'A', text: 'A company has many employees' }, { label: 'B', text: 'A product becomes more valuable as more people use it' }, { label: 'C', text: 'A company operates in multiple countries' }, { label: 'D', text: 'A company has many suppliers' }], correctAnswer: 'B', explanation: 'Network effects create a competitive moat where the value of a product or service increases with each additional user, making it harder for competitors to gain traction.' },
      { id: 3, type: 'mcq', question: 'Switching costs are highest for:', options: [{ label: 'A', text: 'Commodity products with many alternatives' }, { label: 'B', text: 'Products that require significant time, money, or effort to replace' }, { label: 'C', text: 'Products that are easily replaceable' }, { label: 'D', text: 'Products with no learning curve' }], correctAnswer: 'B', explanation: 'High switching costs create a moat by making it expensive or difficult for customers to switch to competitors, often due to integration, training, or data migration requirements.' },
      { id: 4, type: 'mcq', question: 'A company with stable or expanding profit margins over 10 years likely has:', options: [{ label: 'A', text: 'No competition' }, { label: 'B', text: 'A sustainable competitive advantage protecting pricing power' }, { label: 'C', text: 'Rising costs that are being passed to customers' }, { label: 'D', text: 'Declining market share' }], correctAnswer: 'B', explanation: 'Maintaining or expanding margins over long periods despite competition suggests strong competitive advantages, pricing power, or cost advantages that protect profitability.' },
      { id: 5, type: 'mcq', question: 'Which is NOT a type of economic moat?', options: [{ label: 'A', text: 'Network effects' }, { label: 'B', text: 'Cost advantages from scale' }, { label: 'C', text: 'High stock price' }, { label: 'D', text: 'Intangible assets like patents or brand' }], correctAnswer: 'C', explanation: 'A high stock price is a valuation metric, not a competitive advantage. Moats are structural advantages like network effects, cost advantages, switching costs, or intangible assets.' },
      { id: 6, type: 'written', question: 'Explain how a company can have a cost advantage moat. What factors create sustainable cost advantages, and how can you identify them in financial statements?', guidance: 'Discuss economies of scale, proprietary technology, access to resources, and other cost advantages. Explain how these might show up in gross margins, operating margins, or ROIC metrics.' },
      { id: 7, type: 'written', question: 'Identify and analyze the competitive moats for your selected company. What type of moat do they possess (network effects, switching costs, cost advantages, brand, etc.)? Is this moat sustainable or at risk? Support your analysis with evidence from their business model, market position, and financial performance.', guidance: 'Be specific about the type of moat and provide concrete evidence. Consider potential threats to the moat and whether competitive advantages are strengthening or weakening. Use margin trends and market share as supporting evidence.' }
    ]
  },
  'module-5': {
    title: 'Expert: Comparative Analysis',
    lesson: `Comparative analysis synthesizes everything you've learned to evaluate companies against each other.

**Framework for Comparison**:

1. **Business Quality**:
   - Which business model is more attractive?
   - Who has stronger competitive advantages?
   - Which faces less disruption risk?

2. **Financial Performance**:
   - Revenue growth rates and sustainability
   - Margin profiles and trends
   - Cash generation efficiency
   - Balance sheet strength

3. **Valuation**:
   - P/E ratios relative to growth (PEG ratio)
   - EV/EBITDA for capital-intensive businesses
   - Price/Sales for high-growth companies
   - Are higher valuations justified by superior metrics?

4. **Risk Assessment**:
   - Competitive threats
   - Regulatory exposure
   - Financial leverage
   - Execution risks

**Making the Decision**:
- Better business + reasonable valuation often beats cheaper but inferior business
- Consider margin of safety in valuation
- Weight qualitative factors (moats, management) with quantitative metrics
- Think about 3-5 year outlook, not just current metrics

**Common Pitfalls**:
- Focusing only on valuation without considering quality
- Extrapolating recent trends indefinitely
- Ignoring balance sheet risks
- Not considering whether growth is profitable`,
    questions: [
      { id: 1, type: 'mcq', question: 'Company A trades at P/E of 30 with 25% revenue growth and 40% margins. Company B trades at P/E of 15 with 5% growth and 20% margins. Which statement is most accurate?', options: [{ label: 'A', text: 'Company B is clearly cheaper and better value' }, { label: 'B', text: 'Company A is overvalued due to high P/E ratio' }, { label: 'C', text: 'Company A\'s higher valuation may be justified by superior growth and margins' }, { label: 'D', text: 'P/E ratios cannot be compared across companies' }], correctAnswer: 'C', explanation: 'Valuation must be considered relative to quality. Company A\'s 5x higher growth rate and 2x better margins could justify a 2x higher P/E ratio. Quality businesses often deserve premium valuations.' },
      { id: 2, type: 'mcq', question: 'The PEG ratio (P/E divided by growth rate) helps evaluate:', options: [{ label: 'A', text: 'Only the P/E ratio' }, { label: 'B', text: 'Valuation relative to growth expectations' }, { label: 'C', text: 'Only profitability' }, { label: 'D', text: 'Only debt levels' }], correctAnswer: 'B', explanation: 'PEG ratio adjusts P/E for growth rate, helping determine if a stock is fairly valued relative to its growth prospects. A PEG below 1.0 may indicate undervaluation relative to growth.' },
      { id: 3, type: 'mcq', question: 'When comparing two companies, you should prioritize:', options: [{ label: 'A', text: 'Only the cheaper valuation' }, { label: 'B', text: 'Only the highest growth rate' }, { label: 'C', text: 'A combination of business quality, financial performance, and reasonable valuation' }, { label: 'D', text: 'Only the largest market cap' }], correctAnswer: 'C', explanation: 'Effective comparative analysis requires evaluating business quality, competitive advantages, financial performance, and valuation together. The best investment often balances quality with reasonable price.' },
      { id: 4, type: 'mcq', question: 'A margin of safety in valuation means:', options: [{ label: 'A', text: 'Buying at any price' }, { label: 'B', text: 'Buying at a discount to estimated intrinsic value to account for uncertainty' }, { label: 'C', text: 'Only buying the cheapest stock' }, { label: 'D', text: 'Ignoring valuation entirely' }], correctAnswer: 'B', explanation: 'A margin of safety provides a buffer against estimation errors and unexpected challenges, buying below estimated fair value to protect against downside risk.' },
      { id: 5, type: 'mcq', question: 'EV/EBITDA is particularly useful for comparing:', options: [{ label: 'A', text: 'Only tech companies' }, { label: 'B', text: 'Capital-intensive businesses with different debt levels' }, { label: 'C', text: 'Only profitable companies' }, { label: 'D', text: 'Only small companies' }], correctAnswer: 'B', explanation: 'EV/EBITDA normalizes for capital structure differences, making it useful for comparing companies with varying debt levels, especially in capital-intensive industries.' },
      { id: 6, type: 'mcq', question: 'When a high-quality business trades at a premium valuation, it may still be attractive if:', options: [{ label: 'A', text: 'It\'s always a bad investment' }, { label: 'B', text: 'The premium is justified by superior growth, margins, and competitive advantages' }, { label: 'C', text: 'It has high debt' }, { label: 'D', text: 'It has declining revenue' }], correctAnswer: 'B', explanation: 'Quality businesses with strong competitive advantages, superior growth, and high returns on capital often deserve premium valuations. The key is whether the premium is justified by fundamentals.' },
      { id: 7, type: 'written', question: 'Explain the concept of "margin of safety" in investment analysis. How would you apply this when comparing two investment opportunities?', guidance: 'Define margin of safety, explain why it matters, and describe how you would use it to make investment decisions when comparing companies with different valuations and quality levels.' },
      { id: 8, type: 'written', question: 'Compare your selected company to one of its major competitors. Analyze both companies across business model, competitive positioning, financial metrics (growth, margins, ROIC), and valuation. Which company represents the better investment opportunity and why? Consider both the quality of the business and the price you\'re paying.', guidance: 'This is expert-level analysis. Provide a balanced view covering qualitative factors (business quality, moats, risks) and quantitative metrics (growth, profitability, valuation). Make a clear recommendation with supporting reasoning. Your analysis should demonstrate synthesis of all concepts from previous modules.' }
    ]
  }
};
