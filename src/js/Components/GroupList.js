import React from 'react'
import PropTypes from 'prop-types'
import { translationModule } from 'kambi-widget-core-library'
import styles from './GroupList.scss'

const t = translationModule.getTranslation.bind(translationModule)

const GroupList = ({ children }) => (
  <ul className={styles.general}>
    <li className={styles.headerRow} key="headerRow">
      <span className={styles.emptyHeader} />
      <span className={styles.header}>{t('win')}</span>
      <span className={styles.header}>{t('qualify')}</span>
    </li>
    {children}
  </ul>
)

/**
 * children {node} list items (countries in group)
 */
GroupList.propTypes = {
  children: PropTypes.node,
}

export default GroupList
