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

export const Source = (): JSX.Element => {
  const [data, setData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${SERVER_ADDRESS}/api/v1/card/`, {
        headers: {
          Authorization: TOKEN(),
        },
      })
      .then((res) => setData(res.data.map((elem) => elem)));
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
            <TableHead>Название</TableHead>
            <TableHead>Артикул</TableHead>
            <TableHead>Бренд</TableHead>
            <TableHead>Ссылка</TableHead>
            <TableHead>Категория</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((elem) => (
            <TableRow key={elem.invoice}>
              <TableCell className="font-medium">{elem.invoice}</TableCell>
              <TableCell>{elem.paymentStatus}</TableCell>
              <TableCell>{elem.paymentMethod}</TableCell>
              <TableCell className="text-right">{elem.totalAmount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

