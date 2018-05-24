import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { widgetModule } from 'kambi-widget-core-library'
import {
  ScrolledList,
  TabPagination,
  BlendedBackground,
  IconHeader,
} from 'kambi-widget-components'
import isMobile from '../Services/mobile'

import GroupList from './GroupList'
import GroupListItem from './GroupListItem'
// import IconHeader from './IconHeader'
import styles from './GroupWidget.scss'

const DEFAULT_BACKGROUND =
  'https://d1fqgomuxh4f5p.cloudfront.net/tournamentdata/worldcup2018/overview-bw-bg-desktop.jpg'
const WORLD_CUP_2018_ID = 2000075007

/**
 *
 * @class GroupWidget
 * @extends {Component}
 */
class GroupWidget extends Component {
  /**
   * Constructs.
   * @param {object} props Component properties
   */
  constructor(props) {
    super(props)
    this.state = {
      usingDefaultBackground: props.backgroundUrl === DEFAULT_BACKGROUND,
      selected: 0,
    }
    this.participantsByGroup = props.groups.reduce((groupsObj, group) => {
      groupsObj[group.groupName] = group.betOffers[
        group.betOffers.length - 1
      ].outcomes.map(outcome => {
        return [outcome.label, outcome.odds]
      })
      return groupsObj
    }, {})
    this.title = props.title ? props.title : props.groups[0].event.group
    this.tagline = props.tagline
      ? props.tagline
      : props.groups[0].betOffers[0].criterion.label
  }

  /**
   * Called after component mounts
   */
  componentDidMount() {
    this.setHeight()
    widgetModule.enableWidgetTransition(true)
  }

  /**
   * used to set the widget height on update and mount
   *
   * @memberof GroupWidget
   */
  setHeight = () => {
    const { height } = document.body.getBoundingClientRect()
    widgetModule.setWidgetHeight(height)
  }

  /**
   * Adds item to betslip
   */
  handleListItemClick(event) {
    if (event.event.openForLiveBetting === true) {
      widgetModule.navigateToLiveEvent(event.event.id)
    } else {
      widgetModule.navigateToEvent(event.event.id)
    }
  }

  /**
   * Generates country icon url
   */
  generateCountryFlagUrl(country) {
    const normalisedCountryName = country.toLowerCase().replace(/\s/g, '_')
    return `${this.props.flagUrl}${normalisedCountryName}.svg`
  }

  /**
   * Sorts outcomes by lowest odds (handles cases when the reference array contains fewer items than outcomes)
   * outcomes { array } array of outcomes
   * referenceArray { array } array of other outcomes to sort against
   */
  sortByLowestOdds(outcomes, referenceArray = []) {
    // sort using other betoffer as reference
    if (referenceArray.length > 0) {
      const ref = referenceArray.map(item => item.participantId)
      return outcomes.sort((a, b) => {
        const p1Idx = ref.indexOf(a.participantId)
        const p2Idx = ref.indexOf(b.participantId)

        if (p1Idx === -1 && p2Idx === -1) {
          // neither exist in the refArray
          return a.odds > b.odds
        } else if (p1Idx === -1) {
          // p1 doesn't exist in refArray
          return 1
        } else if (p2Idx === -1) {
          // p2 doesn't exist in refArray
          return -1
        }
        return ref.indexOf(a.participantId) > ref.indexOf(b.participantId)
          ? 1
          : -1
      })
    }

    return outcomes.sort((a, b) => a.odds > b.odds)
  }

  /**
   * Pairs the betOffer outcomes by participant using participantId
   * runnerUp { shape } runnerUp to be matched
   * winnerOdds { array } array of winner outcomes to match against
   */
  matchOutcomesByParticipant(runnerUp, winnerOdds) {
    let outcomes = [null, runnerUp]
    winnerOdds.forEach(item => {
      if (runnerUp.participantId === item.participantId) {
        outcomes = [item, runnerUp]
      }
    })

    return outcomes
  }

  /**
   *
   * @param {string} nextTeam - most recent homeName from this.nextMatches
   * @param {string} comparable - homeName that has same starting time as nextTeam to check against
   */
  compareAgainstMostRecent(nextTeam, comparable) {
    let nextTeamStats
    let comparableStats
    Object.keys(this.participantsByGroup).forEach((key, idx) => {
      const groupMembers = this.participantsByGroup[key]
      groupMembers.forEach(member => {
        if (member[0] === nextTeam) {
          nextTeamStats = { group: key, odds: member[0] }
        } else if (member[0] === comparable) {
          comparableStats = { group: key, odds: member[0] }
        }
      })
    })

    if (nextTeamStats.group === comparableStats.group) {
      return false
    }

    return nextTeamStats.odds > comparableStats.odds
  }

  /**
   * Holds team's home name of closest tournament's match.
   * @returns {number|null}
   */
  get nextMatchGroupIdx() {
    let selected = 0
    if (!this.nextMatches) {
      return selected
    }

    const mostRecent = this.props.nextMatches[0].event
    // const mostRecentGroup = this.getParticipantGroup(mostRecent.homeName)
    // check if multiple games start at same time
    this.props.nextMatches.forEach((match, idx) => {
      if (idx > 0 && match.event.start === mostRecent.start) {
        // check if in the same group and if not - which has the lowest qualifying odds
        const matchHasLowerOdds = this.compareAgainstMostRecent(
          mostRecent.homeName,
          match.event.homeName
        )
        if (matchHasLowerOdds) {
          selected = idx
        }
        return
      }
      return
    })

    return selected
  }

  /**
   * Renders widget.
   * @returns {XML}
   */
  render() {
    const { groups } = this.props
    const renderTab = idx => (
      <div key={idx} className={styles.tab}>
        {groups[idx].groupName}
      </div>
    )

    return (
      <div className={styles.groupWidget}>
        <BlendedBackground
          backgroundUrl={this.props.backgroundUrl}
          blendWithOperatorColor={this.state.usingDefaultBackground}
          style={{ zIndex: '-1' }}
        />

        <IconHeader
          title={this.title}
          subtitle={this.tagline}
          iconUrl={this.props.iconUrl}
          localStyles={[
            'KambiWidget-primary-background-color',
            styles.headerIcon,
          ]}
        >
          <div
            style={{
              backgroundImage: `url(${this.props.iconUrl})`,
              height: '100%',
            }}
          />
        </IconHeader>
        <TabPagination
          renderTab={renderTab}
          selected={this.state.selected}
          renderTabList={args => (
            <ScrolledList {...args} showControls={!isMobile()} />
          )}
          onTabChange={this.setHeight}
        >
          {groups.map(group => {
            let winnerOdds = []
            let runnerUpOdds = []

            // sort outcomes by lowest odds
            group.betOffers.forEach((offer, idx) => {
              const offerType = offer.description
              if (offerType.toLowerCase() === 'winner') {
                winnerOdds = this.sortByLowestOdds(
                  group.betOffers[idx].outcomes
                )
              } else if (offerType.toLowerCase() === 'top 2') {
                runnerUpOdds = this.sortByLowestOdds(
                  group.betOffers[idx].outcomes,
                  winnerOdds
                )
              }
            })

            // get participant names from runnerUpOdds as it will contain more participants longer
            const groupParticipants = runnerUpOdds.map(
              participant => participant.englishLabel
            )

            return (
              <GroupList key={group.event.id}>
                {runnerUpOdds.map((item, idx) => {
                  let flagUrl = null
                  const participant = groupParticipants[idx]
                  const outcomes = this.matchOutcomesByParticipant(
                    item,
                    winnerOdds
                  )
                  if (group.event.groupId === WORLD_CUP_2018_ID) {
                    flagUrl = this.generateCountryFlagUrl(participant)
                  }
                  return (
                    <GroupListItem
                      key={participant}
                      participant={participant}
                      flagUrl={flagUrl}
                      outcomes={outcomes}
                      handleClick={() => this.handleListItemClick(group)}
                      event={group.event}
                    />
                  )
                })}
              </GroupList>
            )
          })}
        </TabPagination>
      </div>
    )
  }
}

GroupWidget.propTypes = {
  groups: PropTypes.array.isRequired,
  nextMatches: PropTypes.array.isRequired,
  title: PropTypes.string,
  tagline: PropTypes.string,
  backgroundUrl: PropTypes.string,
  iconUrl: PropTypes.string,
  flagUrl: PropTypes.string,
}

export default GroupWidget
