import React from 'react'
import PropTypes from 'prop-types'
import styles from './GroupList.scss'

const GroupList = ({ children }) => (
  <ul className={styles.general}>{children}</ul>
)

/**
 * children {node} list items (countries in group)
 */
GroupList.propTypes = {
  children: PropTypes.node,
}

export default GroupList