import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Image from '../../assets/Image.svg?react';
import styles from './CardTable.module.scss';
import { Card } from '@/pages/Source';
import { useNavigate } from 'react-router';
import { RootPaths } from '@/pages';
import { createSearchParams } from 'react-router-dom';
import { useCallback, useEffect } from 'react';
import { CardItem } from '@/pages/Card';
import dayjs from 'dayjs';

export const CardTable = ({
  data,
  onRow,
  loadMore,
  stopLoad,
  isMarket,
}: {
  data: CardItem[];
  onRow?: (card: Card) => void;
  loadMore: () => void;
  stopLoad: boolean;
  isMarket?: boolean;
}): JSX.Element => {
  const navigate = useNavigate();

  const openCard = (elem: Card): void => {
    navigate({
      pathname: isMarket ? RootPaths.marketcard : RootPaths.card,
      search: createSearchParams({
        id: elem.uid,
      }).toString(),
    });
  };

  const handleScroll = useCallback(() => {
    if (!stopLoad) {
      const tableElement = document.querySelector(`.${styles.table}`);
      if (tableElement) {
        const bottom = tableElement.getBoundingClientRect().bottom <= window.innerHeight;
        if (bottom) {
          loadMore();
        }
      }
    }
  }, [loadMore, stopLoad]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll, stopLoad]);

  return (
    <Table className={styles.table}>
      <TableHeader>
        <TableRow>
          <TableHead>
            <Image />
          </TableHead>
          <TableHead>Название</TableHead>
          <TableHead>Категория</TableHead>
          <TableHead>Доп. тег</TableHead>
          <TableHead>Артикул</TableHead>
          <TableHead>Бренд</TableHead>
          <TableHead>Ссылка</TableHead>
          <TableHead>Цена</TableHead>
          <TableHead>Валюта</TableHead>
          <TableHead>UID</TableHead>
          <TableHead>Создано</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((elem) => (
          <TableRow
            key={elem.card?.uid}
            onClick={() => (onRow ? onRow?.(elem?.card as Card) : openCard(elem?.card as Card))}
          >
            <TableCell>
              {elem?.card?.images?.[0] && (
                <img src={elem?.card?.images?.[0]} alt="img" className={styles.image} />
              )}
            </TableCell>
            <TableCell>{elem.card?.title}</TableCell>
            <TableCell>{elem?.category?.title}</TableCell>
            <TableCell>
              <div className={styles.tags}>
                {elem?.additional_tags?.map((elem) => (
                  <div className={styles.tag}>{elem?.title}</div>
                ))}
              </div>
            </TableCell>
            <TableCell>{elem.card?.internal_pim_id}</TableCell>
            <TableCell>{elem.card?.brand}</TableCell>
            <TableCell>{elem.card?.source_url}</TableCell>
            <TableCell>{elem.card?.price}</TableCell>
            <TableCell>{elem.card?.currency}</TableCell>
            <TableCell className={styles.cellUid}>{elem.card?.uid?.slice(-4)}</TableCell>
            <TableCell>
              {elem.card?.created_at
                ? dayjs(elem.card?.created_at).format('HH:mm DD.MM.YYYY')
                : null}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

