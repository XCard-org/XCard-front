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
      label: 'Общая',
      id: RootPaths.categories,
    },
    {
      label: 'По маркетплейсам',
      id: RootPaths.marketplaces,
    },
  ];

  const bottomMenuItems = [
    {
      label: 'Исходные',
      id: RootPaths.source,
    },
  ];

  const headerItems = [
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
    <div className={styles.app}>
      <div className={styles.header}>
        <div className={styles.logo}>
          <img src={Logo} alt="logo" className={styles.logo} />
        </div>
        <div className={styles.menu}>
          {headerItems.map((item) => (
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
      <div className={styles.page}>
        <div className={styles.sidebar}>
          <div className={styles.sidebarTitle}>База знаний</div>
          <div className={styles.sidebarItems}>
            {menuItems.map((item) => (
              <div
                className={classNames(
                  styles.sidebarItem,
                  item.id === currentItem && styles.sidebarActiveItem,
                )}
                key={item.id}
                onClick={() => onSelect(item.id)}
              >
                {item.label}
              </div>
            ))}
          </div>
          <div className={styles.sidebarTitle}>Карточки</div>
          <div className={styles.sidebarItems}>
            {bottomMenuItems.map((item) => (
              <div
                className={classNames(
                  styles.sidebarItem,
                  item.id === currentItem && styles.sidebarActiveItem,
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
    </div>
  );
};

