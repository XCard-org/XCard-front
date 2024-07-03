/* eslint-disable @typescript-eslint/no-explicit-any */
import styles from './Category.module.scss';
import stylesCats from './Categories.module.scss';
import axios from 'axios';
import { SERVER_ADDRESS, TOKEN } from '@/constants';
import { useEffect, useState } from 'react';
import { Direction } from '@/pages/Categories';
import classNames from 'classnames';
import { ArrowLeft, Check, Trash } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { RootPaths } from '@/pages';

export const Category = (): JSX.Element => {
  const [directions, setDirections] = useState<Direction[]>([]);
  const [rootElements, setRootElements] = useState<Direction[]>([]);
  const [selectedElements, setSelectedElements] = useState<string[]>([]);
  const [rootSelectedElements, setRootSelectedElements] = useState<string[]>([]);

  const getElementsFromRequest = (data: any): Direction[] => {
    return data.map((elem: any) => ({ label: elem.title, id: elem.uid, ...elem }));
  };

  const onElementSelected = (direction: Direction, nestValue: number): void => {
    setSelectedElements((prev) => {
      const newValue = [...prev];
      newValue[nestValue] = direction.id;
      return newValue;
    });
  };

  const onElementDeleted = (id: string, nest: number): void => {
    axios
      .delete(`${SERVER_ADDRESS}/api/v1/tag/${id}`, {
        headers: {
          Authorization: TOKEN(),
        },
      })
      .then(() => {
        if (nest) {
          setDirections((prev) => {
            const newValues = [...prev];
            newValues[nest - 1].elements = newValues[nest - 1].elements?.filter(
              (elem) => elem.id !== id,
            );
            return newValues;
          });
        } else {
          setRootElements((prev) => prev.filter((elem) => elem.id !== id));
        }
      });
  };

  const onSelectDirection = (direction: Direction, nestValue: number): void => {
    if (nestValue < 2) {
      axios
        .get(`${SERVER_ADDRESS}/api/v1/tag/${direction.id}/children`, {
          headers: {
            Authorization: TOKEN(),
          },
        })
        .then((res) => {
          setDirections((prev) => [
            ...(prev?.slice(0, nestValue) || []),
            {
              label: direction.label,
              id: direction.id,
              elements: getElementsFromRequest(res.data),
            },
          ]);
        });
    }
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
      .then((res) => setRootElements(getElementsFromRequest(res.data)));
  }, []);

  const onChangeRootSelected = (id: string, selected: boolean): void => {
    setRootSelectedElements((prev) => {
      if (selected) {
        return prev.filter((elem) => elem !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const onDetailsClicked = (): void => {
    axios
      .post(
        `${SERVER_ADDRESS}/api/v1/tag/${searchParams.get('id')}/link/`,
        {
          src_id: rootSelectedElements,
        },
        {
          headers: {
            Authorization: TOKEN(),
          },
        },
      )
      .then(() => {
        navigate({
          pathname: RootPaths.detail,
          search: searchParams.toString(),
        });
      });
  };

  return (
    <div className={styles.category}>
      <div className={styles.back}>
        <ArrowLeft />
        Назад
      </div>
      <div className={styles.pageWrap}>
        <div className={styles.title}>Название новой категории</div>
        <div>
          <div className={styles.addTags}>Добавьте теги характеристик</div>
          <div className={stylesCats.categories}>
            <div className={stylesCats.menu}>
              <div className={stylesCats.directions}>
                <CategoryItem
                  onCategoryClick={(id) => onSelectDirection(id, 0)}
                  elements={rootElements}
                  onElementSelected={(direction) => onElementSelected(direction, 0)}
                  selectedElement={selectedElements[0]}
                  onDelete={(elem) => onElementDeleted(elem, 0)}
                />
                {directions?.map((direction, idx) => (
                  <CategoryItem
                    key={direction.id}
                    elements={direction.elements}
                    onCategoryClick={(id) => onSelectDirection(id, idx + 1)}
                    bordered={false}
                    onElementSelected={(direction) => onElementSelected(direction, idx + 1)}
                    selectedElement={selectedElements[idx + 1]}
                    onDelete={(elem) => onElementDeleted(elem, idx + 1)}
                    isLeaf={idx === 1}
                    rootSelectedElements={rootSelectedElements}
                    onChangeRootSelected={(selected, id) => onChangeRootSelected(id, selected)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className={styles.add} onClick={onDetailsClicked}>
          Детализировать характеристики
        </div>
      </div>
    </div>
  );
};

const CategoryItem = ({
  onCategoryClick,
  bordered = true,
  elements,
  onElementSelected,
  selectedElement,
  onDelete,
  isLeaf,
  onChangeRootSelected,
  rootSelectedElements,
}: {
  onCategoryClick: (direction: Direction) => void;
  bordered?: boolean;
  elements: Direction[] | undefined;
  onElementSelected: (element: Direction) => void;
  selectedElement: string;
  onDelete: (id: string) => void;
  isLeaf?: boolean;
  rootSelectedElements?: string[];
  onChangeRootSelected?: (selected: boolean, id: string) => void;
}): JSX.Element => {
  const onElementClick = (elem: Direction): void => {
    if (!isLeaf) {
      onCategoryClick(elem);
      onElementSelected(elem);
    } else {
      onChangeRootSelected?.(rootSelectedElements?.includes(elem.id) || false, elem.id);
    }
  };

  return (
    <div className={stylesCats.direction}>
      <div
        className={classNames(
          stylesCats.categoriesList,
          !bordered && stylesCats.categoriesListNotBordered,
        )}
      >
        {elements?.map((elem) => (
          <div
            className={classNames(
              stylesCats.category,
              styles.categoryItem,
              (selectedElement === elem.id || rootSelectedElements?.includes(elem.id)) &&
                stylesCats.categorySelected,
            )}
            key={elem.id}
            onClick={() => onElementClick(elem)}
          >
            {elem.label}
            <Trash
              className={stylesCats.trash}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(elem.id);
              }}
            />
            {rootSelectedElements?.includes(elem.id) ? <Check className={styles.check} /> : null}
          </div>
        ))}
      </div>
    </div>
  );
};

