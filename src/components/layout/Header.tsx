import classNames from 'classnames';
import styles from './Header.module.scss';
import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { RootPaths } from '@/pages';
import Logo from '../../assets/Logo.svg';

export const Header = (): JSX.Element => {
  const location = useLocation();

  const getDefaultItem = (): string => {
    return location.pathname;
  };

  const [currentItem, setCurrentItem] = useState(getDefaultItem());

  const navigate = useNavigate();

  const menuItems = [
    {
      label: 'База знаний',
      id: RootPaths.categories,
    },
    {
      label: 'Маркетплейсы',
      id: RootPaths.marketplaces,
    },
    {
      label: 'Сгенерировать',
      id: RootPaths.generate,
      className: styles.itemPrimary,
    },
  ];

  const onSelect = (id: string): void => {
    setCurrentItem(id);
    navigate(id);
  };

  return (
    <div>
      <div className={styles.header}>
        <div className={styles.logo}>
          <img src={Logo} alt="logo" className={styles.logo} />
        </div>
        <div className={styles.menu}>
          {menuItems.map((item) => (
            <div
              className={classNames(
                styles.item,
                item?.className,
                item.id === currentItem && styles.activeItem,
              )}
              key={item.id}
              onClick={() => onSelect(item.id)}
            >
              {item.label}
            </div>
          ))}
        </div>
      </div>

      <Outlet />
    </div>
  );
};

