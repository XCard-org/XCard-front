import Edit from '../assets/Edit.svg?react';
import styles from './EditButton.module.scss';

export const EditButton = (): JSX.Element => {
  return (
    <div className={styles.editWrapper}>
      <Edit />
    </div>
  );
};

