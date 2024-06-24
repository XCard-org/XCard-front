import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AddButton } from '../../components/AddButton';
import Delete from '../../assets/Delete.svg?react';
import Edit from '../../assets/Edit.svg?react';
import styles from './Setup.module.scss';

export const Setup = (): JSX.Element => {
  return (
    <div className={styles.setup}>
      <h2 className={styles.header}>Тип девайса</h2>
      <div>
        <div className={styles.synonymHeader}>
          <h3>Синонимы</h3>
          <AddButton className={styles.add} />
        </div>
        <div className={styles.synonyms}>
          {synonyms?.map((synonym, idx) => (
            <div className={styles.synonym} key={idx}>
              <p>{synonym}</p>
              <div className={styles.synonymActions}>
                <Delete className={styles.synonymAction} />
                <Edit className={styles.synonymAction} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h3 className={styles.itemHeader}>Юниты</h3>
        <Select>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={'Free text'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Free text</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <h3 className={styles.itemHeader}>Обязательно</h3>
        <Select>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={'Yes'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Yes</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <h3 className={styles.itemHeader}>Использование LLM</h3>
        <Select>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Must" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Must</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

const synonyms = [
  'Синоним',
  'Синоним',
  'Синоним',
  'Синоним',
  'Синоним',
  'Синоним',
  'Синоним',
  'Синоним',
  'Синоним',
];

