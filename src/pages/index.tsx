import { createBrowserRouter } from 'react-router-dom';
import { Categories } from './Categories';
import { Header } from '@/components/layout/Header';
import { MarketPlaces } from '@/pages/MarketPlaces';
import { Generate } from '@/pages/Generage';
import { SignIn } from '@/pages/SignIn';
import { PrivateComponent } from '@/components/PrivateComponent';
import { SignUp } from '@/pages/SignUp';

export const RootPaths = {
  root: '/',
  categories: '/categories',
  marketplaces: '/marketplaces',
  generate: '/generate',
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

