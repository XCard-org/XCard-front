import styles from './Source.module.scss';
import { useNavigate } from 'react-router';
import { RootPaths } from '@/pages';
import { SourceTable } from '@/containers/SourceContainer/SourceTable';
import { Select, TreeSelect, TreeSelectProps } from 'antd';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { SERVER_ADDRESS, TOKEN } from '@/constants';
import { DefaultOptionType } from 'antd/es/select';

export type Card = {
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
  description: string;
  created_at?: string;
};

export const Source = (): JSX.Element => {
  const navigate = useNavigate();
  const [additionalTags, setAdditionalTags] = useState([]);
  const [treeData, setTreeData] = useState<Omit<DefaultOptionType, 'label'>[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const onScrape = (): void => {
    navigate(RootPaths.scrape);
  };

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

    axios
      .get(`${SERVER_ADDRESS}/api/v1/tag/`, {
        params: {
          is_main_kb: false,
        },
        headers: {
          Authorization: TOKEN(),
        },
      })
      .then((res) => {
        setAdditionalTags(
          res.data?.map((elem: { title: string; uid: string }) => ({
            label: elem?.title,
            value: elem?.uid,
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

  return (
    <div className={styles.source}>
      <div className={styles.header}>
        <div className={styles.title}>
          <div className={styles.titleValue}>Исходные</div>
          <TreeSelect
            treeDataSimpleMode
            dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
            placeholder="Категория"
            onChange={(e) => setSelectedCategory(e)}
            loadData={onLoadData}
            treeData={treeData}
            multiple={true}
            popupMatchSelectWidth={false}
            className={styles.selectCat}
          />
          <Select
            popupMatchSelectWidth={false}
            options={additionalTags}
            placeholder="Дополнительный тег"
            mode="multiple"
            className={styles.selectTag}
            onChange={(e) => setSelectedTags(e)}
          />
        </div>
        <div className={styles.scrape} onClick={onScrape}>
          Соскрейпить
        </div>
      </div>
      <SourceTable tags={selectedTags} categories={selectedCategory} />
    </div>
  );
};

