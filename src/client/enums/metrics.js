const Metrics = {
    ACCURACY: {
        name: 'Accuracy',
        value: 'ACCURACY'
    },
    F1_SCORE: {
        name: 'F1 Score',
        value: 'F1_SCORE'
    },
    RECALL: {
        name: 'Recall',
        value: 'RECALL'
    },
    PRECISION: {
        name: 'Precision',
        value: 'PRECISION'
    },
    CONFIDENCE: {
        name: 'Confidence',
        value: 'CONFIDENCE'
    },
    EXACT_MATCH: {
        name: 'Exact Match',
        value: 'EXACT_MATCH'
    },
    SEMANTIC_SIMILARITY: {
        name: 'Semantic Similarity',
        value: 'SEMANTIC_SIMILARITY'
    },
    MAP: {
        name: 'mAP',
        value: 'MAP'
    },
    MAR: {
        name: 'mAR',
        value: 'MAR'
    }
};

const availableMetricsForModel = {
    IMAGE_CLASSIFIER: {
        ACCURACY: Metrics.ACCURACY,
        F1_SCORE: Metrics.F1_SCORE,
        RECALL: Metrics.RECALL,
        PRECISION: Metrics.PRECISION
    },
    TABULAR_CLASSIFIER: {
        ACCURACY: Metrics.ACCURACY,
        F1_SCORE: Metrics.F1_SCORE,
        RECALL: Metrics.RECALL,
        PRECISION: Metrics.PRECISION
    },
    TEXT_CLASSIFIER: {
        ACCURACY: Metrics.ACCURACY,
        F1_SCORE: Metrics.F1_SCORE,
        RECALL: Metrics.RECALL,
        PRECISION: Metrics.PRECISION
    },
    Q_N_A: {
        F1_SCORE: Metrics.F1_SCORE,
        EXACT_MATCH: Metrics.EXACT_MATCH,
        SEMANTIC_SIMILARITY: Metrics.SEMANTIC_SIMILARITY
    },
    DOCUMENT_PROCESSING: {
        MAP: Metrics.MAP,
        MAR: Metrics.MAR,
        EXACT_MATCH: Metrics.EXACT_MATCH
    },
    UNSUPERVISED_OBJECT_DETECTION: {CONFIDENCE: Metrics.CONFIDENCE}
};

export const getMetricsForModel = (modelType) => {
    return availableMetricsForModel[modelType];
};
