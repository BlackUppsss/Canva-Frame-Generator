export type Image = {
    title: string;
    url: string;
    height: number;
    width: number;
};
export type PaginatedResponse = {
    nextPage?: number;
    pageCount: number;
    images: Image[];
};
const STATIC_IMAGES: Image[] = [
    {
        title: "Bee",
        url: "https://www.canva.dev/example-assets/images/bee.png",
        width: 640,
        height: 640,
    },
    {
        title: "Dolphin",
        url: "https://www.canva.dev/example-assets/images/dolphin.jpg",
        width: 640,
        height: 640,
    },
    {
        title: "Canva Logo",
        url: "https://www.canva.dev/example-assets/images/logo.png",
        width: 240,
        height: 240,
    },
    {
        title: "Puppy",
        url: "https://www.canva.dev/example-assets/images/puppyhood.jpg",
        width: 400,
        height: 300,
    },
];
const generateImages = (numImages: number) => {
    const images: Image[] = [];
    for (let i = 0; i < numImages; i++) {
        const baseImage = STATIC_IMAGES[i % STATIC_IMAGES.length];
        if (baseImage) {
            images.push({
                ...baseImage,
                title: `${baseImage.title} ${Math.floor(i / STATIC_IMAGES.length) + 1}`,
            });
        }
    }
    return images;
};
export const getImages = async (page: number): Promise<PaginatedResponse> => {
    await new Promise((res) => setTimeout(res, 1000));
    const imagesPerPage = 10;
    const totalImages = 50;
    const totalPages = Math.ceil(totalImages / imagesPerPage);
    const startIndex = (page - 1) * imagesPerPage;
    const endIndex = startIndex + imagesPerPage;
    const allImages = generateImages(totalImages);
    const pageImages = allImages.slice(startIndex, endIndex);
    return {
        pageCount: totalPages,
        nextPage: page < totalPages ? page + 1 : undefined,
        images: pageImages,
    };
};
