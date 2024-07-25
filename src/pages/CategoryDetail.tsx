import stylesCat from './Category.module.scss';
import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { SERVER_ADDRESS, TOKEN } from '@/constants';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styles from './CategoryDetail.module.scss';
import { Direction, LeafCategory, getElementsFromRequest } from '@/pages/Categories';
import { Button } from '@/components/ui/button';
import { RootPaths } from '@/pages';
import { BackButton } from '@/components/BackButton';
import { Unlink } from 'lucide-react';

export const CategoryDetail = (): JSX.Element => {
  const navigate = useNavigate();

  const [linked, setLinked] = useState<Array<{ title: string; uid: string }>>([]);
  const [searchParams] = useSearchParams();
  const [properties, setProperties] = useState<Array<{ uid: string }>>([]);

  const [newCat, setNewCat] = useState<{ title: string }>();

  const loadProps = useCallback((): void => {
    axios
      .get(`${SERVER_ADDRESS}/api/v1/tag/${searchParams.get('id')}/property`, {
        headers: {
          Authorization: TOKEN(),
        },
      })
      .then((res) => {
        setProperties(res.data);
      });
  }, [searchParams]);

  const addProperty = (): void => {
    axios
      .post(
        `${SERVER_ADDRESS}/api/v1/tag/${searchParams.get('id')}/property`,
        {
          value: '',
          key: 'Имя категории',
        },
        {
          headers: {
            Authorization: TOKEN(),
          },
        },
      )
      .then((res) => {
        setProperties((prev) => [res.data, ...prev]);
      });
  };

  useEffect(() => {
    axios
      .get(`${SERVER_ADDRESS}/api/v1/tag/${searchParams.get('id')}/link/`, {
        headers: {
          Authorization: TOKEN(),
        },
      })
      .then((res) => {
        setLinked(res.data);
        loadProps();
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
  }, [loadProps, searchParams]);

  const direction: Direction = {
    elements: getElementsFromRequest(properties),
    id: '1',
    label: 'Характеристики',
  };

  const onSave = (): void => {
    navigate(RootPaths.marketplaces);
  };

  const onPropertyUpdated = (
    key: string,
    tagId: string,
    id: string,
    body: Record<string, string | Array<string> | boolean | number>,
  ): void => {
    axios.put(
      `${SERVER_ADDRESS}/api/v1/tag/${tagId}/property/${id}`,
      { ...body, key: body.key || key },
      {
        headers: {
          Authorization: TOKEN(),
        },
      },
    );
  };

  const onPropertyDeleted = (id: string): void => {
    const tagId = searchParams.get('id');
    setProperties((prev) => {
      const newValues = [...prev];

      return newValues.filter((elem) => elem.uid !== id);
    });
    axios.delete(`${SERVER_ADDRESS}/api/v1/tag/${tagId}/property/${id}`, {
      headers: {
        Authorization: TOKEN(),
      },
    });
  };

  const onUnlink = (id: string): void => {
    const tagId = searchParams.get('id');
    axios
      .delete(`${SERVER_ADDRESS}/api/v1/tag/${tagId}/link/${id}`, {
        headers: {
          Authorization: TOKEN(),
        },
      })
      .then(() => {
        setLinked((prev) => prev.filter((elem) => elem.uid !== id));
        loadProps();
      });
  };

  return (
    <div className={stylesCat.category}>
      <div className={styles.header}>
        <BackButton />
        <Button onClick={onSave}>Сохранить</Button>
      </div>
      <div className={stylesCat.pageWrap}>
        <div className={stylesCat.title}>{newCat?.title}</div>
        <div className={styles.content}>
          <div className={styles.tags}>
            <div className={stylesCat.addTags}>Выбранные категории</div>
            <div className={styles.categories}>
              {linked.map((elem) => (
                <div className={styles.categoryItem} key={elem.uid}>
                  {elem.title}
                  <Unlink className={styles.unlink} onClick={() => onUnlink(elem.uid)} />
                </div>
              ))}
            </div>
          </div>

          <div className={styles.leaf}>
            <LeafCategory
              direction={direction}
              onPropertyUpdated={(id, body) =>
                onPropertyUpdated(newCat?.title as string, searchParams.get('id') || '', id, body)
              }
              onDelete={(id) => onPropertyDeleted(id)}
              onPropertyCreated={addProperty}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

