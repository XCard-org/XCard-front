import { createBrowserRouter } from 'react-router-dom';
import { Categories } from './Categories';
import { Header } from '@/components/layout/Header';
import { MarketPlaces } from '@/pages/MarketPlaces';

export const RootPaths = {
  root: '/',
  categories: '/categories',
  marketplaces: '/marketplaces',
  generate: '/generate',
  error: '*',
};

export const router = createBrowserRouter([
  {
    path: RootPaths.root,
    element: <Header />,
    children: [
      {
        path: RootPaths.categories,
        element: <Categories />,
      },
      {
        path: RootPaths.marketplaces,
        element: <MarketPlaces />,
      },
      {
        path: RootPaths.generate,
        element: <>generate</>,
      },
    ],
  },
  {
    path: RootPaths.error,
    element: <h1>Page Not Found 404</h1>,
  },
]);

