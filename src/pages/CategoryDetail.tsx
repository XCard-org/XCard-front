import { ArrowLeft } from 'lucide-react';
import stylesCat from './Category.module.scss';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { SERVER_ADDRESS, TOKEN } from '@/constants';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styles from './CategoryDetail.module.scss';
import { Direction, LeafCategory, getElementsFromRequest } from '@/pages/Categories';
import { Button } from '@/components/ui/button';
import { RootPaths } from '@/pages';

export const CategoryDetail = (): JSX.Element => {
  const navigate = useNavigate();

  const [linked, setLinked] = useState<Array<{ title: string }>>([]);
  const [searchParams] = useSearchParams();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [properties, setProperties] = useState([]);

  const [newCat, setNewCat] = useState<{ title: string }>();

  useEffect(() => {
    axios
      .get(`${SERVER_ADDRESS}/api/v1/tag/${searchParams.get('id')}/link/`, {
        headers: {
          Authorization: TOKEN(),
        },
      })
      .then((res) => {
        setLinked(res.data);

        axios
          .get(`${SERVER_ADDRESS}/api/v1/tag/${searchParams.get('id')}/property`, {
            headers: {
              Authorization: TOKEN(),
            },
          })
          .then((res) => {
            setProperties(res.data);
          });
      });

    axios
      .get(`${SERVER_ADDRESS}/api/v1/tag/${searchParams.get('id')}`, {
        params: {
          root: true,
        },
        headers: {
          Authorization: TOKEN(),
        },
      })
      .then((res) => {
        setNewCat(res.data);
      });
  }, [searchParams]);

  const direction: Direction = {
    elements: getElementsFromRequest(properties),
    id: '1',
    label: 'Характеристики',
  };

  const onSave = (): void => {
    navigate(RootPaths.marketplaces);
  };

  return (
    <div className={stylesCat.category}>
      <div className={styles.header}>
        <div className={stylesCat.back} onClick={() => navigate(-1)}>
          <ArrowLeft />
          Назад
        </div>
        <Button onClick={onSave}>Сохранить</Button>
      </div>
      <div className={stylesCat.pageWrap}>
        <div className={stylesCat.title}>{newCat?.title}</div>
        <div className={styles.content}>
          <div className={styles.tags}>
            <div className={stylesCat.addTags}>Выбранные категории</div>
            <div className={styles.categories}>
              {linked.map((elem) => (
                <div className={styles.categoryItem}>{elem.title}</div>
              ))}
            </div>
          </div>

          <div className={styles.leaf}>
            <LeafCategory direction={direction} />
          </div>
        </div>
      </div>
    </div>
  );
};

