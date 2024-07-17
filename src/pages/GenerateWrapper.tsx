import { SERVER_ADDRESS, TOKEN } from '@/constants';
import axios from 'axios';
import { useEffect, useState } from 'react';
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
  const [pageData, setPageData] = useState();

  useEffect(() => {
    if (currentPage) {
      currentPage === 'source'
        ? axios
            .get(`${SERVER_ADDRESS}/api/v1/card/`, {
              headers: {
                Authorization: TOKEN(),
              },
            })
            // @ts-expect-error no err
            .then((res) => setPageData(res.data.map((elem) => elem.card)))
        : axios
            .get(`${SERVER_ADDRESS}/api/v1/marketplacecard/`, {
              headers: {
                Authorization: TOKEN(),
              },
            })
            // @ts-expect-error no err
            .then((res) => setPageData(res.data.map((elem) => elem.card)));
    }
  }, [currentPage]);

  const onCardSelected = (card: Card): void => {
    if (currentPage) {
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
          {pageData && <CardTable data={pageData} onRow={onCardSelected} />}
        </div>
      </div>
    </div>
  );
};

