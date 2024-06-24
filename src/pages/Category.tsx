import styles from './Categories.module.scss';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from '@/components/ui/breadcrumb';
import { useNavigate } from 'react-router';
import Plus from '../assets/Plus.svg?react';
import Edit from '../assets/Edit.svg?react';
import { Button } from '@/components/ui/button';

const items: Array<{
  label: string;
  value: string;
}> = [
  { label: 'Смартфоны', value: 'phones' },
  { label: 'Смартфоны', value: 'phones' },
  { label: 'Смартфоны', value: 'phones' },
  { label: 'Смартфоны', value: 'phones' },
  { label: 'Смартфоны', value: 'phones' },
  { label: 'Смартфоны', value: 'phones' },
  { label: 'Смартфоны', value: 'phones' },
  { label: 'Смартфоны', value: 'phones' },
];

export const Category = ({ path, label }: { path: string[]; label: string }): JSX.Element => {
  const navigate = useNavigate();

  const getNavigateLink = (pathIndex: number): string => {
    let navigateLink = '';

    for (let i = 0; i < pathIndex; i++) {
      navigateLink += '/' + path[i];
    }
    return navigateLink;
  };

  const navigateTo = (to: string): void => {
    navigate(to);
  };

  return (
    <div className={styles.categories}>
      <div className={styles.header}>
        <Breadcrumb>
          <BreadcrumbList>
            {path.map((elem, idx) => (
              <BreadcrumbItem>
                <BreadcrumbLink
                  onClick={() => navigateTo(getNavigateLink(idx))}
                  className={styles.crumbText}
                >
                  {elem}
                </BreadcrumbLink>
              </BreadcrumbItem>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
        <div className={styles.title}>
          <h2>{label}</h2>
          <Button variant="outline" size="icon" className={styles.add}>
            <Plus />
          </Button>
        </div>
      </div>
      <div className={styles.list}>
        {items?.map((category, idx) => (
          <div className={styles.category} key={idx}>
            <div>{category.label}</div>
            <div className={styles.editWrapper}>
              <Edit />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

