declare const __brand: unique symbol;
type Brand<B> = { [__brand]: B };
export type Branded<BaseType, BrandLabel> = BaseType & Brand<BrandLabel>;
