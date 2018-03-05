import React from 'react'
import PropTypes from 'prop-types'
import styles from './GroupList.scss'

const GroupList = ({ children }) => (
  <ul className={styles.general}>
    <li className={styles.headerRow} key='headerRow'>
      <span className={styles.emptyHeader} />
      <span className={styles.header}>To Win</span>
      <span className={styles.header}>To Qualify</span>
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