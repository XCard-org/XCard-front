import { ArrowLeft } from 'lucide-react';
import stylesCat from './Category.module.scss';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { SERVER_ADDRESS, TOKEN } from '@/constants';
import { useSearchParams } from 'react-router-dom';
import styles from './CategoryDetail.module.scss';

export const CategoryDetail = (): JSX.Element => {
  const [linked, setLinked] = useState<Array<{ title: string }>>([]);
  const [searchParams] = useSearchParams();
  // @ts-expect-error ddd
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    axios
      .get(`${SERVER_ADDRESS}/api/v1/tag/${searchParams.get('id')}/link/`, {
        headers: {
          Authorization: TOKEN(),
        },
      })
      .then((res) => {
        setLinked(res.data);
      });

    axios
      .get(`${SERVER_ADDRESS}/api/v1/marketplace/${searchParams.get('marketId')}/property/`, {
        headers: {
          Authorization: TOKEN(),
        },
      })
      .then((res) => {
        console.log(res.data);
        setProperties(res.data);
      });
  }, [searchParams]);

  return (
    <div className={stylesCat.category}>
      <div className={stylesCat.back}>
        <ArrowLeft />
        Назад
      </div>
      <div className={stylesCat.pageWrap}>
        <div className={stylesCat.title}>Название новой категории</div>
        <div>
          <div className={stylesCat.addTags}>Добавьте категории</div>
          <div className={styles.categories}>
            {linked.map((elem) => (
              <div className={styles.categoryItem}>{elem.title}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

