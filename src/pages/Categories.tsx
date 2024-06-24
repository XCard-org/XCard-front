/* eslint-disable @typescript-eslint/no-explicit-any */
import styles from './Categories.module.scss';
import { AddButton } from '../components/AddButton';
import { useEffect, useState } from 'react';
import classNames from 'classnames';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import axios from 'axios';
import { SERVER_ADDRESS, TOKEN } from '@/constants';
import { Label } from '@radix-ui/react-label';
import { Check, Trash } from 'lucide-react';

export type Direction = {
  label: string;
  id: string;
  elements?: Direction[];
  isLeaf?: boolean;
};

export const Categories = (): JSX.Element => {
  const [directions, setDirections] = useState<Direction[]>([]);
  const [rootElements, setRootElements] = useState<Direction[]>([]);
  const [selectedElements, setSelectedElements] = useState<string[]>([]);

  const getElementsFromRequest = (data: any): Direction[] => {
    return data.map((elem: any) => ({ label: elem.title, id: elem.uid }));
  };

  const onElementSelected = (direction: Direction, nestValue: number): void => {
    setSelectedElements((prev) => {
      const newValue = [...prev];
      newValue[nestValue] = direction.id;
      return newValue;
    });
  };

  const onElementDeleted = (id: string): void => {
    axios
      .delete(`${SERVER_ADDRESS}/api/v1/tag/`, {
        params: {
          id,
        },
        headers: {
          Authorization: TOKEN,
        },
      })
      .then(() => {
        if (parent) {
          setDirections((prev) => prev.filter((elem) => elem.id !== id));
        } else {
          setRootElements((prev) => prev.filter((elem) => elem.id !== id));
        }
      });
  };

  const onSelectDirection = (direction: Direction, nestValue: number): void => {
    axios
      .get(`${SERVER_ADDRESS}/api/v1/tag/${direction.id}/children`, {
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
            isLeaf: nestValue > 1,
          },
        ]);
      });
  };

  useEffect(() => {
    axios
      .get(`${SERVER_ADDRESS}/api/v1/tag/`, {
        params: {
          root: true,
        },
        headers: {
          Authorization: TOKEN,
        },
      })
      .then((res) => setRootElements(getElementsFromRequest(res.data)));
  }, []);

  const onTagCreated = (title: string, parent: string | undefined, nestValue: number): void => {
    axios
      .post(
        `${SERVER_ADDRESS}/api/v1/tag/`,
        {
          title,
          description: '',
          is_main_kb: true,
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
        if (parent) {
          setDirections((prev) => {
            const newValue = [...prev];
            console.log(newValue[nestValue - 1]);
            newValue[nestValue - 1].elements = [
              { label: res.data.title, id: res.data.uid },
              ...(newValue[nestValue - 1]?.elements || []),
            ];
            newValue.findIndex((elem) => elem.id === parent);
            return newValue;
          });
        } else {
          setRootElements((prev) => [...prev, { label: res.data.title, id: res.data.uid }]);
        }
      });
  };

  return (
    <div className={styles.categories}>
      <div className={styles.menu}>
        <div className={styles.header}>
          <div className={styles.title}>
            <h2>База знаний</h2>
          </div>
        </div>
        <div className={styles.directions}>
          <Category
            title={'Товарное направление'}
            onCategoryClick={(id) => onSelectDirection(id, 0)}
            onTagCreated={(title) => onTagCreated(title, undefined, 0)}
            elements={rootElements}
            onElementSelected={(direction) => onElementSelected(direction, 0)}
            selectedElement={selectedElements[0]}
            onDelete={onElementDeleted}
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
                onTagCreated={(title) => onTagCreated(title, direction.id, idx + 1)}
                onElementSelected={(direction) => onElementSelected(direction, idx + 1)}
                selectedElement={selectedElements[idx + 1]}
                onDelete={onElementDeleted}
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
  onDelete,
}: {
  title: string;
  onCategoryClick: (direction: Direction) => void;
  bordered?: boolean;
  onTagCreated: (title: string) => void;
  elements: Direction[] | undefined;
  onElementSelected: (element: Direction) => void;
  selectedElement: string;
  onDelete: (id: string) => void;
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
      <div className={styles.categoryHeader}>
        <div className={styles.categoryTitle}>{title}</div>
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
            <Trash
              className={styles.trash}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(elem.id);
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

const LeafCategory = ({ title }: { title: string }): JSX.Element => {
  return (
    <div className={classNames(styles.direction, styles.lastDirection)}>
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
          <div className={styles.leafBlock}>
            <div className={styles.leafTitle}>Features</div>
            <div className={styles.leafInput}>
              <div className={styles.leafInputLabel}>Feature Name</div>
              <Input placeholder="Device" className={styles.input} />
            </div>
            <div className={styles.leafInput}>
              <div className={styles.leafInputLabel}>Units</div>
              <Input placeholder="Units" className={styles.input} />
            </div>
            <div className={styles.leafInputs}>
              <div className={styles.leafInput}>
                <div className={styles.leafInputLabel}>Is Mandatory</div>
                <Checkbox className={styles.checkbox} />
              </div>
              <div className={styles.leafInput}>
                <div className={styles.leafInputLabel}>LLM Usability</div>
                <div className={styles.leafInputValue}>Must</div>
              </div>
            </div>
          </div>
          <div className={styles.leafBlock}>
            <div className={styles.leafTitle}>Synonyms</div>
            <div className={styles.synonyms}>
              <div className={styles.synonym}>Synonym</div>
              <div className={styles.synonym}>Synonym</div>
              <div className={styles.synonym}>Synonym</div>
              <div className={styles.synonym}>Synonym</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

