import React from 'react';
import PropTypes from 'prop-types';
import styles from './IconHeader.scss';

const IconHeader = ({ title, subtitle, iconUrl='' }) => (
   <header className={`KambiWidget-card-text-color KambiWidget-card-border-color KambiWidget-font ${styles.header}`}>
      {
         iconUrl &&
         <div
            className={[styles.icon, 'KambiWidget-primary-background-color'].join(' ')}
            style={{backgroundImage: `url(${iconUrl})`}}
         />
      }     
      <div className={styles.container}>
         <div className={styles.title} title={title}>{title}</div>
         <div className={styles.subtitle} title={subtitle}>{subtitle}</div>
      </div>
   </header>
);

/**
 * @property [children] {ReactElement} Header's icon markup
 * @property title {string} Header's title
 * @property [subtitle] {string} Header's subtitle
 */
IconHeader.propTypes = {
   iconUrl: PropTypes.string,
   title: PropTypes.string.isRequired,
   subtitle: PropTypes.string
};

export default IconHeader;