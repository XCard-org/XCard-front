import { AddButton } from '@/components/AddButton';
import styles from './Cards.module.scss';
import { Button } from '@/components/ui/button';
import { RestrictionCard } from '@/components/RestrictionCard';

export const Cards = (): JSX.Element => {
  return (
    <div className={styles.cards}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <h2>OZON</h2>
          <AddButton />
        </div>
        <Button>К тегам</Button>
      </div>
      <div className={styles.cardsList}>
        {cards?.map((card) => (
          <RestrictionCard key={card.id} value={card} />
        ))}
      </div>
    </div>
  );
};

const cards = [
  {
    label: 'Название карточки',
    value: 'В названии карточки недопустимо иметь название марки',
    id: 1,
  },
  {
    label: 'Название карточки',
    value: 'В названии карточки недопустимо иметь название марки',
    id: 2,
  },
  {
    label: 'Название карточки',
    value: 'В названии карточки недопустимо иметь название марки',
    id: 31,
  },
  {
    label: 'Название карточки',
    value: 'В названии карточки недопустимо иметь название марки',
    id: 41,
  },
  {
    label: 'Название карточки',
    value: 'В названии карточки недопустимо иметь название марки',
    id: 51,
  },
  {
    label: 'Название карточки',
    value: 'В названии карточки недопустимо иметь название марки',
    id: 61,
  },
];

