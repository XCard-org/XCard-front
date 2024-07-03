import { createBrowserRouter } from 'react-router-dom';
import { Categories } from './Categories';
import { Header } from '@/components/layout/Header';
import { MarketPlaces } from '@/pages/MarketPlaces';
import { Generate } from '@/pages/Generage';
import { SignIn } from '@/pages/SignIn';
import { PrivateComponent } from '@/components/PrivateComponent';
import { SignUp } from '@/pages/SignUp';
import { Category } from '@/pages/Category';
import { CategoryDetail } from '@/pages/CategoryDetail';

export const RootPaths = {
  root: '/',
  categories: '/categories',
  category: '/category',
  marketplaces: '/marketplaces',
  generate: '/generate',
  detail: '/detail',
  signin: '/signin',
  signup: '/signup',
  error: '*',
};

export const router = createBrowserRouter([
  {
    path: RootPaths.root,
    element: (
      <PrivateComponent>
        <Header />
      </PrivateComponent>
    ),
    children: [
      {
        path: RootPaths.categories,
        element: (
          <PrivateComponent>
            <Categories />
          </PrivateComponent>
        ),
      },
      {
        path: RootPaths.marketplaces,
        element: (
          <PrivateComponent>
            <MarketPlaces />
          </PrivateComponent>
        ),
      },
      {
        path: RootPaths.generate,
        element: (
          <PrivateComponent>
            <Generate />
          </PrivateComponent>
        ),
      },
      {
        path: RootPaths.category,
        element: (
          <PrivateComponent>
            <Category />
          </PrivateComponent>
        ),
      },
      {
        path: RootPaths.detail,
        element: (
          <PrivateComponent>
            <CategoryDetail />
          </PrivateComponent>
        ),
      },
    ],
  },
  {
    path: RootPaths.signin,
    element: <SignIn />,
  },
  {
    path: RootPaths.signup,
    element: <SignUp />,
  },
  {
    path: RootPaths.error,
    element: <h1>Page Not Found 404</h1>,
  },
]);

