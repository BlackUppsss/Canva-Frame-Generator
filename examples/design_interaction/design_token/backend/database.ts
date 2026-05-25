type BrandId = string;
type BrandData = {
    name: string;
    users: Map<UserId, UserData>;
};
type UserId = string;
type UserData = {
    name: string;
    designs: Map<DesignId, DesignData>;
};
type DesignId = string;
type DesignData = {
    title: string;
    defaultDimensions: {
        width: number;
        height: number;
    };
};
export const createInMemoryDatabase = () => {
    return new Map<BrandId, BrandData>();
};
let brandCounter = 1;
export const createBrand = () => ({
    name: `FooBar's Brand ${brandCounter++}`,
    users: new Map<UserId, UserData>(),
});
let userCounter = 1;
export const createUser = () => ({
    name: `Foo Bar ${userCounter++}`,
    designs: new Map<DesignId, DesignData>(),
});
