type Placeholder = {
    height: number;
    width: number;
};
export function generatePlaceholders({ numPlaceholders, height, }: {
    numPlaceholders: number;
    height: number;
}): Placeholder[] {
    return Array.from({ length: numPlaceholders }, (_, i) => {
        const width = Math.floor(height * (Math.random() * 0.5 + 1));
        return {
            height,
            width,
        };
    });
}
