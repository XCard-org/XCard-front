/* eslint-disable @typescript-eslint/no-explicit-any */
import { SERVER_ADDRESS, TOKEN } from '@/constants';
import { Direction } from '@/pages/Categories';
import axios from 'axios';
import styles from './Categories.module.scss';
import { AddButton } from '../components/AddButton';
import { useEffect, useState } from 'react';
import classNames from 'classnames';
import { Input } from '@/components/ui/input';
import { Label } from '@radix-ui/react-label';
import { Check } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

export const MarketPlaces = (): JSX.Element => {
  const [directions, setDirections] = useState<Direction[]>([]);
  const [rootElements, setRootElements] = useState<Direction[]>([]);
  const [selectedElements, setSelectedElements] = useState<string[]>([]);

  const getElementsFromRequest = (data: any): Direction[] => {
    return data.map((elem: any) => ({ label: elem.name || elem.key, id: elem.uid }));
  };

  const onElementSelected = (direction: Direction, nestValue: number): void => {
    setSelectedElements((prev) => {
      const newValue = [...prev];
      newValue[nestValue] = direction.id;
      return newValue;
    });
  };

  const onSelectDirection = (direction: Direction, nestValue: number): void => {
    if (!nestValue) {
      setDirections((prev) => [
        ...(prev?.slice(0, nestValue) || []),
        {
          label: direction.label,
          id: direction.id,
          elements: [
            {
              label: 'Ограничения',
              id: '0',
            },
            {
              label: 'Категории',
              id: '1',
            },
          ],
        },
      ]);
    } else {
      axios
        .get(`${SERVER_ADDRESS}/api/v1/marketplace/${selectedElements[0]}/restriction/`, {
          headers: {
            Authorization: TOKEN,
          },
        })
        .then((res) => {
          setDirections((prev) => [
            ...(prev?.slice(0, nestValue) || []),
            {
              label: direction.label,
              id: direction.id,
              elements: getElementsFromRequest(res.data),
              isLeaf: true,
            },
          ]);
        });
    }
  };

  useEffect(() => {
    axios
      .get(`${SERVER_ADDRESS}/api/v1/marketplace/`, {
        params: {
          root: true,
        },
        headers: {
          Authorization: TOKEN,
        },
      })
      .then((res) => setRootElements(getElementsFromRequest(res.data)));
  }, []);

  const onTagCreated = (title: string, parent: string | undefined): void => {
    if (!parent) {
      axios
        .post(
          `${SERVER_ADDRESS}/api/v1/marketplace/`,
          {
            name: title,
            url: 'https://www.ozon.ru/',
          },
          {
            params: {
              parent_id: parent,
            },
            headers: {
              Authorization: TOKEN,
            },
          },
        )
        .then((res) => {
          setRootElements((prev) => [...prev, { label: res.data.name, id: res.data.uid }]);
        });
    } else {
      axios
        .post(
          `${SERVER_ADDRESS}/api/v1/marketplace/${selectedElements[0]}/restriction/`,
          {
            key: title,
            url: 'https://www.ozon.ru/',
          },
          {
            headers: {
              Authorization: TOKEN,
            },
          },
        )
        .then((res) => {
          setDirections((prev) => {
            const newValue = [...prev];
            newValue[1].elements = [
              { label: res.data.key, id: res.data.uid },
              ...(newValue[1]?.elements || []),
            ];
            newValue.findIndex((elem) => elem.id === parent);
            return newValue;
          });
        });
    }
  };

  return (
    <div className={styles.categories}>
      <div className={styles.menu}>
        <div className={styles.header}>
          <div className={styles.title}>
            <h2>По маркетплейсам</h2>
          </div>
        </div>
        <div className={styles.directions}>
          <Category
            title={'Маркетплейс'}
            onCategoryClick={(id) => onSelectDirection(id, 0)}
            onTagCreated={(title) => onTagCreated(title, undefined)}
            elements={rootElements}
            onElementSelected={(direction) => onElementSelected(direction, 0)}
            selectedElement={selectedElements[0]}
          />
          {directions?.map((direction, idx) =>
            direction?.isLeaf ? (
              <LeafCategory title={direction.label} />
            ) : (
              <Category
                title={direction.label}
                elements={direction.elements}
                onCategoryClick={(id) => onSelectDirection(id, idx + 1)}
                bordered={false}
                onTagCreated={(title) => onTagCreated(title, direction.id)}
                onElementSelected={(direction) => onElementSelected(direction, idx + 1)}
                selectedElement={selectedElements[idx + 1]}
                noAdd={idx === 0}
              />
            ),
          )}
        </div>
      </div>
    </div>
  );
};

const Category = ({
  title,
  onCategoryClick,
  bordered = true,
  onTagCreated,
  elements,
  onElementSelected,
  selectedElement,
  noAdd,
}: {
  title: string;
  onCategoryClick: (direction: Direction) => void;
  bordered?: boolean;
  onTagCreated: (title: string) => void;
  elements: Direction[] | undefined;
  onElementSelected: (element: Direction) => void;
  selectedElement: string;
  noAdd?: boolean;
}): JSX.Element => {
  const onElementClick = (elem: Direction): void => {
    onCategoryClick(elem);
    onElementSelected(elem);
  };

  const [newValue, setNewValue] = useState('');
  const onSave = (): void => {
    onTagCreated(newValue);
    setNewValue('');
  };

  return (
    <div className={styles.direction}>
      <div className={classNames(styles.categoryHeader, noAdd && styles.headerMoved)}>
        <div className={styles.categoryTitle}>{title}</div>
        {!noAdd && (
          <AddButton>
            <div className={styles.tooltip}>
              <div className={classNames('grid w-full max-w-sm items-center gap-1.5')}>
                <Label htmlFor="add">Title</Label>
                <Input
                  id="add"
                  placeholder="Title"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                />
              </div>
              <Check className={styles.tooltipCheck} onClick={onSave} />
            </div>
          </AddButton>
        )}
      </div>
      <div
        className={classNames(styles.categoriesList, !bordered && styles.categoriesListNotBordered)}
      >
        {elements?.map((elem) => (
          <div
            className={classNames(
              styles.category,
              selectedElement === elem.id && styles.categorySelected,
            )}
            onClick={() => onElementClick(elem)}
          >
            {elem.label}
          </div>
        ))}
      </div>
    </div>
  );
};

const LeafCategory = ({ title }: { title: string }): JSX.Element => {
  return (
    <div className={classNames(styles.direction, styles.lastDirection, styles.direction412)}>
      <div className={styles.categoryHeader}>
        <div className={styles.categoryTitle}>{title}</div>
        <AddButton>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="add">Title</Label>
            <Input id="add" placeholder="Title" />
          </div>
        </AddButton>
      </div>
      <div className={styles.leafCategoryList}>
        <div className={styles.leaf}>
          <div className={styles.verticalLeaf}>
            <div>Название ограничения</div>
            <div className={classNames(styles.leafInput, styles.input120)}>
              <div className={styles.leafInputLabel}>Тип</div>
              <Input placeholder="Тип" className={styles.input} />
            </div>
            <Textarea
              placeholder="Описание ограничения"
              className={classNames('resize-none', styles.textarea)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

