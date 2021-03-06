import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { widgetModule } from 'kambi-widget-core-library'
import uniqBy from 'lodash.uniqby'
import {
  ScrolledList,
  TabPagination,
  BlendedBackground,
  IconHeader,
  ArrowButton,
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
    }
    this.participantsByGroup = props.groups.reduce((groupsObj, group) => {
      groupsObj[group.groupName] = group.betOffers[
        group.betOffers.length - 1
      ].outcomes.map(outcome => {
        return [outcome.label, outcome.odds]
      })
      return groupsObj
    }, {})
    this.title = props.title ? props.title : props.groups[0].group
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
    if (event.openForLiveBetting === true) {
      widgetModule.navigateToLiveEvent(event.id)
    } else {
      widgetModule.navigateToEvent(event.id)
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
          if (!a.odds) {
            return 1
          }

          if (!b.odds) {
            return -1
          }

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

    return outcomes.sort((a, b) => {
      if (!a.odds) {
        return 1
      }

      if (!b.odds) {
        return -1
      }

      return a.odds > b.odds
    })
  }

  /**
   * Pairs the betOffer outcomes by participant using participantId
   * runnerUp { shape } runnerUp to be matched
   * winnerOdds { array } array of winner outcomes to match against
   */
  matchOutcomesByParticipant(winnerOdds, runnerUp, participant) {
    let outcomes = [null, null]
    winnerOdds.forEach(item => {
      if (participant.english === item.englishLabel) {
        outcomes[0] = item
      }
    })
    runnerUp.forEach(item => {
      if (participant.english === item.englishLabel) {
        outcomes[1] = item
      }
    })

    return outcomes
  }

  getNextMatchGroup = team => {
    let nextMatchGroupIdx = 0 // fallback to first tab
    Object.keys(this.participantsByGroup).forEach((key, idx) => {
      const groupMembers = this.participantsByGroup[key]
      groupMembers.forEach(member => {
        if (team === member[0]) {
          nextMatchGroupIdx = idx
        }
      })
    })
    return nextMatchGroupIdx
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
          nextTeamStats = { group: key, odds: member[0], idx }
        }
        if (member[0] === comparable) {
          comparableStats = { group: key, odds: member[0], idx }
        }
      })
    })

    if (nextTeamStats.group === comparableStats.group) {
      return { hasLowerOdds: true, groupIdx: comparableStats.idx }
    }

    return {
      hasLowerOdds: nextTeamStats.odds > comparableStats.odds,
      groupIdx: comparableStats.idx,
    }
  }

  /**
   * Holds team's home name of closest tournament's match.
   * @returns {number|null}
   */
  nextMatchGroupIdx = () => {
    const { nextMatches } = this.props
    if (!nextMatches || nextMatches.length < 2) {
      return 0
    }

    const mostRecent = nextMatches[0]
    let selected = this.getNextMatchGroup(mostRecent.homeName)

    // check if multiple games start at same time
    nextMatches.forEach((match, idx) => {
      if (new Date(match.start) === new Date(mostRecent.start)) {
        // check if in the same group and if not - which has the lowest qualifying odds
        const matchHasLowerOddsWGroupIdx = this.compareAgainstMostRecent(
          mostRecent.homeName,
          match.homeName
        )
        if (matchHasLowerOddsWGroupIdx.hasLowerOdds) {
          selected = matchHasLowerOddsWGroupIdx.groupIdx
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
    const nextMatchTab = this.nextMatchGroupIdx()
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
              backgroundSize: 'contain',
            }}
          />
        </IconHeader>
        <TabPagination
          renderTab={renderTab}
          selected={nextMatchTab}
          renderTabList={args => {
            return (
              <ScrolledList
                {...args}
                showControls={!isMobile()}
                arrowButtonBackground="#fff"
              />
            )
          }}
          onTabChange={this.setHeight}
        >
          {groups.map(group => {
            let winnerOdds = []
            let runnerUpOdds = []

            // sort outcomes by lowest odds
            group.betOffers.forEach((offer, idx) => {
              const offerType = offer.to
              if (offerType === 1) {
                winnerOdds = this.sortByLowestOdds(
                  group.betOffers[idx].outcomes
                )
              } else if (offerType === 2) {
                runnerUpOdds = this.sortByLowestOdds(
                  group.betOffers[idx].outcomes,
                  winnerOdds
                )
              }
            })

            // get participant names from runnerUpOdds as it will contain more participants longer
            let groupParticipants = []
            const uniqueParticipants = uniqBy(
              [...winnerOdds, ...runnerUpOdds],
              'participant'
            )
            if (uniqueParticipants.length !== 0) {
              groupParticipants = uniqueParticipants.map(participant => {
                return {
                  english: participant.englishLabel,
                  native: participant.label,
                }
              })
            }

            return (
              <GroupList key={group.id}>
                {groupParticipants.map((participant, idx) => {
                  let flagUrl = null
                  const participantNative = participant.native
                  const participantInEnglish = participant.english
                  const outcomes = this.matchOutcomesByParticipant(
                    winnerOdds,
                    runnerUpOdds,
                    participant
                  )
                  if (group.groupId === WORLD_CUP_2018_ID) {
                    flagUrl = this.generateCountryFlagUrl(participantInEnglish)
                  }
                  return (
                    <GroupListItem
                      key={participantNative}
                      participant={participantNative}
                      flagUrl={flagUrl}
                      outcomes={outcomes}
                      handleClick={() => this.handleListItemClick(group)}
                      event={group}
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
