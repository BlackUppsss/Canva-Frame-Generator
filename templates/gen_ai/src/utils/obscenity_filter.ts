import { englishDataset, englishRecommendedTransformers, RegExpMatcher, } from "obscenity";
export const getObsceneWords = (input: string): string[] => {
    const matcher = new RegExpMatcher({
        ...englishDataset.build(),
        ...englishRecommendedTransformers,
    });
    const matches = matcher.getAllMatches(input, true);
    const obsceneWords: string[] = [];
    for (const match of matches) {
        const { phraseMetadata } = englishDataset.getPayloadWithPhraseMetadata(match);
        if (phraseMetadata?.originalWord) {
            obsceneWords.push(phraseMetadata.originalWord);
        }
    }
    return [...new Set(obsceneWords)];
};
