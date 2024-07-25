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

export const CardTable = ({
  data,
  onRow,
  loadMore,
  stopLoad,
  isMarket,
}: {
  data: Card[];
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
          <TableHead>Артикул</TableHead>
          <TableHead>Бренд</TableHead>
          <TableHead>Ссылка</TableHead>
          <TableHead>Цена</TableHead>
          <TableHead>Валюта</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((elem) => (
          <TableRow key={elem.uid} onClick={() => (onRow ? onRow?.(elem) : openCard(elem))}>
            <TableCell>
              {elem?.images?.[0] && (
                <img src={elem?.images?.[0]} alt="img" className={styles.image} />
              )}
            </TableCell>
            <TableCell>{elem.title}</TableCell>
            <TableCell>{elem.internal_pim_id}</TableCell>
            <TableCell>{elem.brand}</TableCell>
            <TableCell>{elem.source_url}</TableCell>
            <TableCell>{elem.price}</TableCell>
            <TableCell>{elem.currency}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

