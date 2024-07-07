import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { SERVER_ADDRESS, TOKEN } from '@/constants';
import axios from 'axios';
import { useEffect, useState } from 'react';
import styles from './Source.module.scss';
import { useNavigate } from 'react-router';
import { RootPaths } from '@/pages';
import Image from '../assets/Image.svg?react';

export const Source = (): JSX.Element => {
  const [data, setData] = useState<
    Array<{
      uid: string;
      title: string;
      manufacturer_id: string;
      manufacturer_url: string;
      price: number;
      currency: string;
      internal_pim_id: string;
      source_url: string;
      images: string[];
      brand: string;
    }>
  >([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${SERVER_ADDRESS}/api/v1/card/`, {
        headers: {
          Authorization: TOKEN(),
        },
      })
      // @ts-expect-error no err
      .then((res) => setData(res.data.map((elem) => elem.card)));
  }, []);

  const onScrape = (): void => {
    navigate(RootPaths.scrape);
  };

  return (
    <div className={styles.source}>
      <div className={styles.header}>
        <div className={styles.title}>Исходные</div>
        <div className={styles.scrape} onClick={onScrape}>
          Соскрейпить
        </div>
      </div>
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
            <TableRow key={elem.uid}>
              <TableCell>
                {elem.images?.[0] && (
                  <img src={elem.images?.[0]} alt="img" className={styles.image} />
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
    </div>
  );
};

