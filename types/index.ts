import { GetServerSidePropsContext } from 'next';
import { Adapter } from 'next-auth/adapters';
import { OAuthConfig } from 'next-auth/providers';
import { GoogleProfile } from 'next-auth/providers/google';

export interface AppProps {
  Component: React.FC;
  pageProps: {
    session: Session;
    [key: string]: any;
  };
}

export interface AdminsPageProps {
  swal: any;
}

export interface CategoriesPageProps {
  swal: any;
}

export interface ProductsPageProps {
  swal: any;
}

export interface SettingsPageProps {
  swal: any;
}

export interface IconProps {
  className?: string;
}

export interface LayoutProps {
  children: React.ReactNode;
}

export interface NavBarProps {
  show: boolean;
}

export interface Property {
  name: string;
  values: string;
}

export interface ProductFormProps {
  _id?: string;
  title?: string;
  description?: string;
  price?: string;
  images?: string[];
  category?: CategoryWithParentType;
  properties?: PropertyType;
  hidden?: boolean;
}

export interface CategoryType {
  _id?: string;
  name: string;
  parent?: string;
  properties?: PropertyType[];
}

export interface CategoryFormProps {
  _id?: string;
  name?: string;
  parentCategory?: string;
  properties?: PropertyType[];
}

export interface CategoryWithParentType {
  _id?: string;
  name: string;
  parent?: CategoryType;
  properties?: PropertyType[];
}

export interface PropertyType {
  name?: string;
  values?: string[];
}

export interface SettingsType {
  name: string;
  value: string;
  save?: () => void;
}

export interface CouponType {
  code: string;
  type: string;
  percentOff?: number;
  amountOff?: number;
  applyTo: 'all' | 'product' | 'category';
  product?: string;
  category?: string;
  id?: string;
  details?: {};
}

export interface CouponState {
  [couponCode: string]: string;
}

export interface CouponComponentProps {
  coupon: CouponType;
  couponName: string;
  removeCoupon: (couponName: string) => void;
  handleCouponChange: (
    couponName: string,
    newValues: Partial<CouponType>
  ) => void;
  couponApplyTo: Record<string, string>;
  setCouponApplyTo: React.Dispatch<
    React.SetStateAction<Record<string, string>>
  >;
  couponProduct: Record<string, string>;
  setCouponProduct: React.Dispatch<
    React.SetStateAction<Record<string, string>>
  >;
  couponCategory: Record<string, string>;
  setCouponCategory: React.Dispatch<
    React.SetStateAction<Record<string, string>>
  >;
  couponTypes: Record<string, string>;
  setCouponTypes: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  products: ProductType[];
  categories: CategoryType[];
}

export interface ExistingCouponType {
  name: string;
  id?: string;
}

export interface ProductType {
  _id: string;
  title: string;
  description: string;
  price: string;
  images: string[];
  category: CategoryWithParentType;
  properties: { [key: string]: string };
  stripePriceId: string;
  hidden: boolean;
  save?: () => void;
}

export interface AdminType {
  _id: string;
  email: string;
  updatedAt: string;
  createdAt: string;
}

export interface TileProps {
  title: string;
  stat: number | string;
  dollars?: boolean;
}

export interface OrderType {
  userEmail: string;
  line_items: line_item[];
  name: string;
  email: string;
  streetAddress: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  paid: boolean;
  createdAt: string;
  updatedAt: string;
  subTotal?: number;
  _id: string;
}

export interface line_item {
  quantity?: number;
  subTotal?: number;
  price?: string;
  price_data?: {
    currency?: string;
    product?: string;
    product_data?: {
      name?: string;
    };
    unit_amount?: number;
  };
}

export interface GetServerSideProps {
  req: GetServerSidePropsContext['req'];
  res: GetServerSidePropsContext['res'];
  query?: {
    id: string;
  };
}

export interface authOptionsType {
  secret: string;
  providers: OAuthConfig<GoogleProfile>[];
  adapter: Adapter;
  callbacks: {};
}

export interface User {
  name?: string;
  email?: string;
  image?: string;
}

export interface Session {
  user?: User;
  expires: string;
}
