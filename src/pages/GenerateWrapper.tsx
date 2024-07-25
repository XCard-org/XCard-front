/* eslint-disable react-hooks/exhaustive-deps */
import { SERVER_ADDRESS, TOKEN } from '@/constants';
import axios from 'axios';
import { useEffect, useState, useCallback } from 'react';
import styles from './Generate.module.scss';
import { Radio } from 'antd';
import { CardTable } from '@/containers/CardTableContainer/CardTable';
import { useNavigate } from 'react-router';
import { RootPaths } from '@/pages';
import { createSearchParams } from 'react-router-dom';
import { Card } from '@/pages/Source';

export const GenerateWrapper = (): JSX.Element => {
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState<string>();
  const [pageData, setPageData] = useState<Card[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [skip, setSkip] = useState<number>(0);
  const [stopLoad, setStopLoad] = useState<boolean>(false);

  const loadMore = useCallback(
    async (forsed?: boolean) => {
      if (loading) return;
      setLoading(true);
      try {
        if ((!stopLoad && skip === pageData.length) || forsed) {
          const endpoint = currentPage === 'source' ? 'card' : 'marketplacecard';
          const res = await axios.get(`${SERVER_ADDRESS}/api/v1/${endpoint}/`, {
            params: {
              skip: !forsed ? skip : 0,
              limit: !forsed ? skip + 50 : 50,
            },
            headers: {
              Authorization: TOKEN(),
            },
          });
          if (res.data.length < 50) {
            setStopLoad(true);
          }
          setPageData((prevData) => [
            ...prevData,
            ...res.data.map((elem: { card: Card } & Card) =>
              endpoint === 'card' ? elem.card : elem,
            ),
          ]);
          setSkip((prevSkip) => prevSkip + 50);
        }
      } catch (error) {
        console.error('Failed to load data', error);
      } finally {
        setLoading(false);
      }
    },
    [loading, stopLoad, skip, pageData, currentPage],
  );

  useEffect(() => {
    if (typeof currentPage === 'string') {
      setPageData([]);
      setSkip(0);
      setStopLoad(false);

      loadMore(true);
    }
  }, [currentPage]);

  const onCardSelected = (card: Card): void => {
    if (typeof currentPage === 'string') {
      navigate({
        pathname: RootPaths.generate,
        search: createSearchParams({
          id: card.uid,
          type: currentPage,
        }).toString(),
      });
    }
  };

  return (
    <div className={styles.generate}>
      <div className={styles.content}>
        <div className={styles.title}>Генерация карточки товара</div>
        <div className={styles.settings}>
          <h3 className={styles.params}>Параметры</h3>
          <div className={styles.marketParams}>
            <div>
              <div className={styles.name}>Что улучшить?</div>
              <Radio.Group onChange={(e) => setCurrentPage(e.target.value)}>
                <Radio value={'source'}>Исходная карточка</Radio>
                <Radio value={'market'}>Карточка маркетплейса</Radio>
              </Radio.Group>
            </div>
          </div>
          {pageData && (
            <CardTable
              data={pageData}
              onRow={onCardSelected}
              loadMore={loadMore}
              stopLoad={stopLoad}
            />
          )}
        </div>
      </div>
    </div>
  );
};

