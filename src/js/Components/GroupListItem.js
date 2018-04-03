import React from 'react'
import PropTypes from 'prop-types'
import { OutcomeButton } from 'kambi-widget-components'
import styles from './GroupListItem.scss'

class GroupListItem extends React.Component {
  /**
   * Removes images with broken urls
   */

  handleBrokenUrl = () => {
    this.img.style.display = 'none'
  }

  render() {
    const { participant, outcomes, flagUrl, handleClick, event } = this.props

    return (
      <div>
        <li className={styles.row}>
          <div className={styles.participantWrapper}>
            {flagUrl ? (
              <div
                className={styles.flag}
                onClick={handleClick}
                ref={img => {
                  this.img = img
                }}
              >
                <img
                  role="presentation"
                  src={flagUrl}
                  onError={this.handleBrokenUrl}
                />
              </div>
            ) : null}
            <span className={styles.participant} onClick={handleClick}>
              {participant}
            </span>
          </div>
          {outcomes.map(
            outcome =>
              outcome ? (
                <div className={styles.button} key={outcome.id}>
                  <OutcomeButton
                    outcome={outcome}
                    label={false}
                    outlineStyle={true}
                    event={event}
                  />
                </div>
              ) : (
                <div className={styles.emptyButton} />
              )
          )}
        </li>
      </div>
    )
  }
}

GroupListItem.defaultProps = {
  flagUrl: null,
}

/**
 * participant { node } list item
 * flagUrl { string } url to item flag
 * outcomes { array } outcomes for betOffer
 * handleClick { func } callback for item click
 */
GroupListItem.propTypes = {
  participant: PropTypes.node.isRequired,
  flagUrl: PropTypes.string,
  outcomes: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  handleClick: PropTypes.func.isRequired,
}

export default GroupListItem
