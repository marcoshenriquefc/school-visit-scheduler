export type IdParam = {
    id: string;
};
export type FormIdParam = {
    formId: string;
};
export type FieldIdParam = {
    fieldId: string;
};

export type SlugParam = {
    slug: string;
};

export type ParamsRequest<T extends string> = {
    [K in T]: string;
};