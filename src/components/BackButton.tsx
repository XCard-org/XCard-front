import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';
import styles from './BackButton.module.scss';

export const BackButton = (): JSX.Element => {
  const navigate = useNavigate();

  return (
    <div className={styles.back} onClick={() => navigate(-1)}>
      <ArrowLeft />
      Назад
    </div>
  );
};

