import styles from './Scrape.module.scss';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { SERVER_ADDRESS, TOKEN } from '@/constants';
import { useNavigate } from 'react-router';
import { RootPaths } from '@/pages';
import { Input, TreeSelect, TreeSelectProps } from 'antd';
import { DefaultOptionType } from 'antd/es/select';
import { useActions } from '@/App';

export const Scrape = (): JSX.Element => {
  const [link, setLink] = useState('');
  const [value, setValue] = useState<string>();

  const navigate = useNavigate();

  const [treeData, setTreeData] = useState<Omit<DefaultOptionType, 'label'>[]>([]);

  useEffect(() => {
    axios
      .get(`${SERVER_ADDRESS}/api/v1/tag/`, {
        params: {
          root: true,
        },
        headers: {
          Authorization: TOKEN(),
        },
      })
      .then((res) => {
        setTreeData(
          res.data?.map((elem: { uid: string; title: string }) => ({
            id: elem.uid,
            pId: 0,
            value: elem.uid,
            title: elem.title,
            nestLevel: 0,
            key: elem.uid,
          })),
        );
      });
  }, []);

  const genTreeNode = (nestLevel: number, id: string, elem: { title: string; uid: string }) => {
    return {
      id: elem.uid,
      pId: id,
      value: elem.uid,
      title: elem.title,
      isLeaf: nestLevel > 0,
      nestLevel: nestLevel + 1,
      key: elem.uid,
    };
  };

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

  const onChange = (newValue: string) => {
    setValue(newValue);
  };

  const { callScraper } = useActions();

  const onStart = (): void => {
    navigate(RootPaths.source);
    callScraper(link, value as string);
  };

  return (
    <div className={styles.scrape}>
      <div className={styles.title}>Скрейпер</div>
      <div>
        <div className={styles.block}>
          <div className={styles.name}>Категория</div>
          <TreeSelect
            treeDataSimpleMode
            style={{ width: '100%' }}
            value={value}
            dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
            placeholder="Выберите категорию"
            onChange={onChange}
            loadData={onLoadData}
            treeData={treeData}
          />
        </div>
        <div className={styles.block}>
          <div className={styles.name}>Источник данных</div>
          <div className={styles.info}>Ссылка</div>
          <Input
            placeholder="www.figma.com"
            value={link}
            onChange={(e) => setLink(e.target.value)}
          />
        </div>
        <div className={styles.start} onClick={onStart}>
          Запустить
        </div>
      </div>
    </div>
  );
};

