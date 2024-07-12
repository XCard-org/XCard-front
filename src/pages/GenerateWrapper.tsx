import { SERVER_ADDRESS, TOKEN } from '@/constants';
import axios from 'axios';
import { useEffect, useState } from 'react';
import styles from './Generate.module.scss';
import { Radio, Select } from 'antd';
import { useNavigate } from 'react-router';
import { RootPaths } from '@/pages';

export const GenerateWrapper = (): JSX.Element => {
  const [currentPage] = useState();

  useEffect(() => {
    if (currentPage) {
      currentPage === 1
        ? axios
            .get(`${SERVER_ADDRESS}/api/v1/card/`, {
              headers: {
                Authorization: TOKEN(),
              },
            })
            .then((res) => console.log(res))
        : axios
            .get(`${SERVER_ADDRESS}/api/v1/marketplacecard/`, {
              headers: {
                Authorization: TOKEN(),
              },
            })
            .then((res) => console.log(res));
    }
  }, [currentPage]);

  const navigate = useNavigate();

  return (
    <div className={styles.generate}>
      <div className={styles.content}>
        <div className={styles.title}>Генерация карточки товара</div>
        <div className={styles.settings}>
          <h3 className={styles.params}>Параметры</h3>
          <div className={styles.marketParams}>
            <div>
              <div className={styles.name}>Что улучшить?</div>
              <Radio.Group onChange={() => navigate(RootPaths.generate)}>
                <Radio value={1}>Исходная карточка</Radio>
                <Radio value={2}>Карточка маркетплейса</Radio>
              </Radio.Group>
            </div>
          </div>
          {currentPage && (
            <Select
              className={styles.marketSelect}
              placeholder="Выберите карточку"
              options={[]}
              // onChange={(e) => setSelectedMarket(e)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

