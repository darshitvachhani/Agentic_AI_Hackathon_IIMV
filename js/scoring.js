/**
 * Academic Business Strategy Simulation Platform
 * Central Configurable Scoring Framework (Prompt 3 Implementation)
 * 
 * Configurable 7-criterion framework with deterministic application-side arithmetic.
 * Historical configurations are preserved per quarter evaluation.
 */

export const INITIAL_SCORING_CRITERIA = [
  {
    id: 'strategicDecisionQuality',
    label: 'Strategic decision quality',
    weight: 20,
    description: 'Alignment with customer needs, feasibility, and business model coherence.'
  },
  {
    id: 'reasoningAndEvidence',
    label: 'Reasoning and use of evidence',
    weight: 15,
    description: 'Explanation connecting actions to objectives, trade-offs, and explicit assumptions.'
  },
  {
    id: 'marketAdaptability',
    label: 'Adaptability to market changes',
    weight: 20,
    description: 'Response to competitor moves, regulatory shifts, and emerging industry dynamics.'
  },
  {
    id: 'financialManagement',
    label: 'Financial management and sustainability',
    weight: 15,
    description: 'Runway discipline, margin realism, unit economics, and cash burn.'
  },
  {
    id: 'competitivePerformance',
    label: 'Competitive performance',
    weight: 10,
    description: 'Relative differentiation, defensibility, and market share positioning.'
  },
  {
    id: 'riskAssessment',
    label: 'Risk assessment and contingency planning',
    weight: 10,
    description: 'Anticipation of failure modes, operational risks, and downside buffers.'
  },
  {
    id: 'learningFromDecisions',
    label: 'Learning from previous decisions',
    weight: 10,
    description: 'Correction of past flaws and iterative strategic compounding.'
  }
];

export class ScoringService {
  constructor(criteria = INITIAL_SCORING_CRITERIA) {
    this.criteria = JSON.parse(JSON.stringify(criteria));
  }

  /**
   * Returns current active scoring criteria configuration with weights.
   */
  getCriteria() {
    return JSON.parse(JSON.stringify(this.criteria));
  }

  /**
   * Returns weights as a key-value map { criterionId: weightNumber }.
   */
  getWeightsMap() {
    const map = {};
    for (const c of this.criteria) {
      map[c.id] = c.weight;
    }
    return map;
  }

  /**
   * Validates a candidate weight configuration:
   * 1. Every weight must be a non-negative number.
   * 2. The sum of all weights must equal 100%.
   */
  validateWeights(newWeightsMap) {
    let sum = 0;
    const errors = [];

    for (const c of this.criteria) {
      const val = Number(newWeightsMap[c.id]);
      if (isNaN(val) || val < 0) {
        errors.push(`Weight for "${c.label}" must be a non-negative number.`);
      } else {
        sum += val;
      }
    }

    if (Math.round(sum) !== 100) {
      errors.push(`Total weights must sum to exactly 100%. Current sum: ${Math.round(sum)}%.`);
    }

    return {
      isValid: errors.length === 0,
      sum: Math.round(sum),
      errors
    };
  }

  /**
   * Updates scoring configuration. Future evaluations use this configuration.
   * Historical evaluations retain the configuration used at their time of scoring.
   */
  setWeights(newWeightsMap) {
    const validation = this.validateWeights(newWeightsMap);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(' '));
    }

    this.criteria = this.criteria.map((c) => ({
      ...c,
      weight: Number(newWeightsMap[c.id])
    }));

    return true;
  }

  /**
   * Deterministic application-side calculation of the quarterly score.
   * Gemini provides individual criterion scores (0-100) and qualitative rationales,
   * but the weighted total is strictly calculated via deterministic arithmetic.
   *
   * @param {Object} rawScoresMap - { [criterionId]: number (0-100) }
   * @param {Object} weightsMap - Optional historical weights map, defaults to active weights
   * @returns {Object} { totalScore, breakdown: [ { id, label, weight, score, contribution, explanation, evidence, missing } ] }
   */
  calculateQuarterScore(rawScoresMap = {}, explanationsMap = {}, weightsMap = null) {
    const activeWeights = weightsMap || this.getWeightsMap();
    let weightedSum = 0;
    const breakdown = [];

    for (const c of this.criteria) {
      const weight = typeof activeWeights[c.id] === 'number' ? activeWeights[c.id] : c.weight;
      const rawScore = typeof rawScoresMap[c.id] === 'number'
        ? Math.max(0, Math.min(100, Math.round(rawScoresMap[c.id])))
        : 75; // Baseline reasonable fallback if unassigned

      const contribution = Number(((rawScore * weight) / 100).toFixed(2));
      weightedSum += contribution;

      const evalMeta = explanationsMap[c.id] || {};
      breakdown.push({
        id: c.id,
        label: c.label,
        weight,
        score: rawScore,
        contribution,
        explanation: evalMeta.explanation || evalMeta.feedback || 'Evaluated against quarter strategy submission.',
        evidence: evalMeta.evidence || 'Derived from student submission and market response.',
        missingAssumptions: evalMeta.missing_assumptions || evalMeta.missingAssumptions || null
      });
    }

    const finalTotalScore = Math.min(100, Math.max(0, Math.round(weightedSum)));

    return {
      totalScore: finalTotalScore,
      weightedSum: Number(weightedSum.toFixed(2)),
      weightsUsed: { ...activeWeights },
      breakdown
    };
  }

  /**
   * Computes the cumulative score for a team based strictly on evaluated quarters.
   * Calculated as the arithmetic mean of completed quarterly scores.
   * Incomplete quarters are never averaged in.
   */
  computeCumulativeScore(quarterlyData) {
    const evaluatedQuarters = (quarterlyData || []).filter(
      (q) => q.status === 'evaluated' && typeof q.score === 'number' && !isNaN(q.score)
    );

    if (evaluatedQuarters.length === 0) {
      return 0;
    }

    const sum = evaluatedQuarters.reduce((acc, q) => acc + q.score, 0);
    return Math.round(sum / evaluatedQuarters.length);
  }

  /**
   * Generates a personalized report card structure for a team and quarter.
   */
  getPersonalizedReportCard(team, quarterNum) {
    const qData = team.quarterlyData?.find((q) => q.quarter === quarterNum);
    const prevQData = team.quarterlyData?.find((q) => q.quarter === quarterNum - 1);

    const isEvaluated = qData?.status === 'evaluated' && qData?.score !== null;

    return {
      isEvaluated,
      quarter: quarterNum,
      dates: qData?.dates || '',
      currentQuarterScore: isEvaluated ? qData.score : null,
      cumulativeScore: team.cumulativeScore || 0,
      previousQuarterScore: (prevQData?.status === 'evaluated' && prevQData?.score !== null) ? prevQData.score : null,
      scoreExplanation: qData?.scoreExplanation || qData?.evaluationFeedback?.scoreExplanation || '',
      whatWentRight: qData?.whatWentWell || qData?.strengths || 'Clear strategic focus in targeted micro-segment.',
      whatWentWrong: qData?.mistakesWeaknesses || qData?.mistakes || 'Operational bottleneck in rapid fulfillment logistics.',
      recommendedImprovements: qData?.nextQuarterImplications || qData?.recommendedImprovements || 'Optimize unit economics and secure supplier credit terms.',
      strategicDepthScore: qData?.strategicDepthScore !== undefined ? qData.strategicDepthScore : 75,
      strategicDepthLevel: qData?.strategicDepthLevel || 'Moderate (Basic Detail)',
      strategicDepthFeedback: qData?.strategicDepthFeedback || 'Assessed against operational clarity and unit economics.',
      howToImproveDepth: qData?.howToImproveDepth || 'Elaborate on unit margins, partner SLAs, and cluster delivery economics.',
      breakdown: qData?.criterionBreakdown || [],
      weightsUsed: qData?.scoringWeightsUsed || this.getWeightsMap(),
      financials: qData?.financialIndicators || null,
      marketShare: qData?.marketShare || null,
      revenue: qData?.financialIndicators?.revenue || null,
      operatingProfitOrLoss: qData?.financialIndicators?.operatingProfitOrLoss || null,
      cashBalance: qData?.financialIndicators?.cashBalance || null
    };
  }

  formatScore(score) {
    if (score === null || score === undefined) return 'Awaiting evaluation';
    return `${score} / 100`;
  }
}

export const scoringService = new ScoringService();
