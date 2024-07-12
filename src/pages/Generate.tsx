import { Input, Select } from 'antd';
import styles from './Generate.module.scss';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { SERVER_ADDRESS, TOKEN } from '@/constants';
import { AddButton } from '@/components/AddButton';
import classNames from 'classnames';
import { Label } from '@/components/ui/label';
import { Check } from 'lucide-react';

export const Generate = (): JSX.Element => {
  const [markets, setMarkets] = useState([]);
  const [selectedMarket, setSelectedMarket] = useState();
  /* const [treeData, setTreeData] = useState<Omit<DefaultOptionType, 'label'>[]>([]);
  const [value, setValue] = useState<string>();
  const [trends, setTrends] = useState([]);*/

  useEffect(() => {
    axios
      .get(`${SERVER_ADDRESS}/api/v1/marketplace/`, {
        params: {
          root: true,
        },
        headers: {
          Authorization: TOKEN(),
        },
      })
      .then((res) =>
        setMarkets(
          res.data.map((elem: { name: string; uid: string }) => ({
            label: elem.name,
            value: elem.uid,
          })),
        ),
      );

    axios
      .get(`${SERVER_ADDRESS}/api/v1/trend/`, {
        headers: {
          Authorization: TOKEN(),
        },
      })
      .then((res) => {
        console.log(res);
      });
  }, []);

  useEffect(() => {
    axios
      .get(`${SERVER_ADDRESS}/api/v1/tag/`, {
        params: {
          root: true,
          marketplace_id: selectedMarket,
        },
        headers: {
          Authorization: TOKEN(),
        },
      })
      .then(() => {
        /* setTreeData(
          res.data?.map((elem: { uid: string; title: string }) => ({
            id: elem.uid,
            pId: 0,
            value: elem.title,
            title: elem.title,
            selectable: false,
            nestLevel: 0,
            key: elem.title,
          })),
        );*/
      });
  }, [selectedMarket]);
  /*
  const genTreeNode = (nestLevel: number, id: string, elem: { title: string; uid: string }) => {
    return {
      id: elem.uid,
      pId: id,
      value: elem.title,
      title: elem.title,
      isLeaf: nestLevel > 0,
      nestLevel: nestLevel + 1,
      key: elem.title,
    };
  };
/*
  const onLoadData: TreeSelectProps['loadData'] = ({ id, nestLevel }) =>
    axios
      .get(`${SERVER_ADDRESS}/api/v1/tag/${id}/children`, {
        headers: {
          Authorization: TOKEN(),
        },
      })
      .then((res) => {
        setTreeData(
          treeData.concat(
            res.data.map((elem: { title: string; uid: string }) =>
              genTreeNode(nestLevel, id, elem),
            ),
          ),
        );
      });

      /*

  const onChange = (newValue: string) => {
    setValue(newValue);
  };
*/
  const [newTrend, setNewTrend] = useState('');

  const onSave = (): void => {
    axios
      .post(
        `${SERVER_ADDRESS}/api/v1/trend/`,
        {
          title: newTrend,
        },
        {
          headers: {
            Authorization: TOKEN(),
          },
        },
      )
      .then(() => {});
    setNewTrend('');
  };

  const [trendsValue, setTrendsValue] = useState(['']);
  const [level, setLevel] = useState<1 | 2 | 3 | 4 | 5>();
  console.log(level);

  return (
    <div className={styles.generate}>
      <div className={styles.content}>
        <div className={styles.title}>Генерация карточки товара</div>
        <div className={styles.settings}>
          <h3 className={styles.params}>Параметры</h3>
          <div className={styles.marketParams}>
            <div>
              <div className={styles.name}>Маркетплейс</div>
              <Select
                className={styles.marketSelect}
                placeholder="Выберите маркетплейс"
                options={markets}
                onChange={(e) => setSelectedMarket(e)}
              />
            </div>
          </div>
          <div>
            <div className={styles.name}>
              Тренды
              <AddButton>
                <div className={styles.tooltip}>
                  <div className={styles.tooltipFields}>
                    <div className={classNames('grid w-full max-w-sm items-center gap-1.5')}>
                      <Label htmlFor="add">Название</Label>
                      <Input
                        id="add"
                        placeholder="Название"
                        value={newTrend}
                        onChange={(e) => setNewTrend(e.target.value)}
                      />
                    </div>
                    <div className={classNames('grid w-full max-w-sm items-center gap-1.5')}>
                      <Label htmlFor="add">Уровень</Label>
                      <Select
                        id="add"
                        placeholder="Выберите уровень"
                        options={levelOptions}
                        onChange={(e) => setLevel(e)}
                        value={level}
                      />
                    </div>
                  </div>
                  <Check className={styles.tooltipCheck} onClick={onSave} />
                </div>
              </AddButton>
            </div>
            <div className={styles.trendWrapper}>
              {trendsValue.map(() => (
                <div className={styles.trend}>
                  <Select
                    className={styles.marketSelect}
                    placeholder="Выберите слово"
                    options={markets}
                    onChange={(e) => setSelectedMarket(e)}
                  />
                  <Select
                    className={styles.marketSelect}
                    placeholder="Выберите уровень"
                    options={levelOptions}
                    onChange={(e) => setLevel(e)}
                  />
                </div>
              ))}
            </div>
            <div
              className={styles.addTrend}
              onClick={() => setTrendsValue((prev) => [...prev, ''])}
            >
              Добавить тренд
            </div>
          </div>
          {/* <div>
            <div className={styles.name}>Источник данных</div>
            <div>
              <Radio.Group className={styles.radios}>
                <Radio value={1}>
                  <div>
                    <div className={styles.radioName}>Ссылка</div>
                    <div className={styles.radioText}>Информация будет взята по этой ссылке</div>
                  </div>
                </Radio>
                <Radio value={2} disabled>
                  <div>
                    <div className={styles.radioName}>База данных</div>
                    <div className={styles.radioText}>
                      Информация будет взята из этой базы данных
                    </div>
                  </div>
                </Radio>
              </Radio.Group>
            </div>
            </div> */}
          <div>
            <div className={styles.name}>Параметры подключения</div>
            <div className={styles.label}>Веб-сайт</div>
            <Input placeholder="https://www.figma.com/" className={styles.website} />
          </div>
          <div className={styles.start}>Начать</div>
        </div>
      </div>
    </div>
  );
};

const levelOptions = [
  {
    label: 1,
    value: 1,
  },
  {
    label: 2,
    value: 2,
  },
  {
    label: 3,
    value: 3,
  },
  {
    label: 4,
    value: 4,
  },
  {
    label: 5,
    value: 5,
  },
];

