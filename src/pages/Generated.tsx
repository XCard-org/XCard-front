import { useNavigate } from 'react-router';
import styles from './Generated.module.scss';
import { RootPaths } from '@/pages';
import { GeneratedTable } from '@/containers/GeneratedContainer/GeneratedTable';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { SERVER_ADDRESS, TOKEN } from '@/constants';
import { Select, TreeSelect, TreeSelectProps } from 'antd';
import { DefaultOptionType } from 'antd/es/select';
import { useSearchParams } from 'react-router-dom';
import { TableContext } from '@/pages/Source';

export const Generated = (): JSX.Element => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [marketplaceOptions, setMarketplaceOptions] = useState();
  const [selectedMarketplaces, setSelectedMarketplaces] = useState<string[]>(
    searchParams.get('market') ? [searchParams.get('market') as string] : [],
  );
  const [additionalTags, setAdditionalTags] = useState([]);
  const [treeData, setTreeData] = useState<Omit<DefaultOptionType, 'label'>[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string[]>(
    searchParams.get('category') ? [searchParams.get('category') as string] : [],
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(
    searchParams.get('tag') ? [searchParams.get('tag') as string] : [],
  );

  const onGenerate = (): void => {
    navigate(RootPaths.generatetables);
  };

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
        setMarketplaceOptions(
          res.data?.map((elem: { name: string; uid: string }) => ({
            label: elem?.name,
            value: elem?.uid,
          })),
        ),
      );

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

  const onCategoryClick = (id: string): void => {
    setSelectedCategory([id]);
  };

  const onTagClick = (id: string): void => {
    setSelectedTags([id]);
  };

  return (
    <div className={styles.source}>
      <div className={styles.header}>
        <div className={styles.title}>
          <div className={styles.titleValue}>Сгенерированные</div>
          <Select
            popupMatchSelectWidth={false}
            options={marketplaceOptions}
            placeholder="Маркетплейс"
            mode="multiple"
            className={styles.selectMarket}
            onChange={(e) => setSelectedMarketplaces(e)}
            value={selectedMarketplaces}
          />
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
            value={selectedCategory}
          />
          <Select
            popupMatchSelectWidth={false}
            options={additionalTags}
            placeholder="Дополнительный тег"
            mode="multiple"
            className={styles.selectTag}
            onChange={(e) => setSelectedTags(e)}
            value={selectedTags}
          />
        </div>
        <div className={styles.scrape} onClick={onGenerate}>
          Сгенерировать
        </div>
      </div>
      <TableContext.Provider value={{ onCategoryClick, onTagClick }}>
        <GeneratedTable
          marketplaces={selectedMarketplaces}
          categories={selectedCategory}
          tags={selectedTags}
        />
      </TableContext.Provider>
    </div>
  );
};

