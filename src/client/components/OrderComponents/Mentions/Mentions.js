import React from 'react';
import styles from 'styles/mentions.module.css';

const Mentions = () =>
  <div className={styles.mentionbar}>
    <div className={styles.mentiontext}>As seen on</div>
    <a href="https://www.engadget.com/2016/08/30/order-pizza-right-from-your-twitch-stream-with-hungrybot/">
      <img
        src="/public/Engadget.png"
        alt="Engadget link"
        className={styles.logo}
      />
    </a>
    <a href="https://www.producthunt.com/tech/hungrybot">
      <img
        src="/public/PH.png"
        alt="ProductHunt link"
        className={styles.logo}
      />
    </a>
  </div>;

export default Mentions;
