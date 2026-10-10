import styles from './contact.module.css';

export const metadata = { title: 'Contact | Guido Sforni' };

const EMAIL = 'guidosforni@icloud.com';

export default function ContactPage() {
  return (
    <section className={styles.page}>
      <a href={`mailto:${EMAIL}`} className={styles.email}>
        {EMAIL}
      </a>
    </section>
  );
}
