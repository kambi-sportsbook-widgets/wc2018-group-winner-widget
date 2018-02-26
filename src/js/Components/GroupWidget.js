import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { widgetModule } from 'kambi-widget-core-library'
import {
  IconHeader,
  ScrolledList,
  TabPagination,
  BlendedBackground
} from 'kambi-widget-components'
import isMobile from '../Services/mobile'

import GroupList from './GroupList'
import GroupListItem from './GroupListItem'
import styles from './GroupWidget.scss'


const DEFAULT_BACKGROUND = 'assets/overview-bw-bg-desktop.jpg'
const WORLD_CUP_2018_ID = 2000075007

/**
 * Navigates to given group (event) page.
 * @param {object} group Tournament group (event entity)
 */
const onGroupClick = function(group) {
  if (group.event.openForLiveBetting === true) {
    widgetModule.navigateToLiveEvent(group.event.id)
  } else {
    widgetModule.navigateToEvent(group.event.id)
  }
}

/**
 * Called after switching the group.
 * @param {number} idx Group index
 */
const onGroupChange = function(idx) {
  widgetModule.adaptWidgetHeight()
}

class GroupWidget extends Component {
  /**
   * Constructs.
   * @param {object} props Component properties
   */
  constructor(props) {
    super(props)
    widgetModule.enableWidgetTransition(true)

    this.state = {
      usingDefaultBackground: props.backgroundUrl === DEFAULT_BACKGROUND
    }

    this.flagBaseUrl = 'assets/icons/'
  }

  /**
   * Called after component mounts
   */
  componentDidMount() {
    widgetModule.adaptWidgetHeight()
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
    return `${this.flagBaseUrl}${normalisedCountryName}.svg`
  }

   /**
   * Sorts outcomes by lowest odds (handles cases when the reference array contains fewer items than outcomes)
   * outcomes { array } array of outcomes
   * referenceArray { array } array of other outcomes to sort against
   */
  sortByLowestOdds(outcomes, referenceArray=[]) {
    // sort using other betoffer as reference
    if (referenceArray.length > 0) {
      const ref = referenceArray.map(item => item.participantId)
      return outcomes.sort((a, b) => {
        const p1Idx = ref.indexOf(a.participantId)
        const p2Idx = ref.indexOf(b.participantId)
        if (p1Idx === -1 && p2Idx === -1) {
          return a.odds > b.odds
        } else if (p1Idx === -1) {
          return 1
        } else if (p2Idx === -1) {
        return -1
      }
        return ref.indexOf(a.participantId) > ref.indexOf(b.participantId) ? 1 : -1
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
        <BlendedBackground backgroundUrl={this.props.backgroundUrl} blendWithOperatorColor={this.state.usingDefaultBackground} style={{ zIndex: '-1' }}/>
        
        <IconHeader title={this.props.title} subtitle={this.props.tagline} />
        <TabPagination
          renderTab={renderTab}
          selected={this.props.selected}
          renderTabList={args => (
            <ScrolledList {...args} showControls={!isMobile()} />
          )}
          onTabChange={onGroupChange}
        >
          {
            groups.map(group => {
              let winnerOdds = []
              let runnerUpOdds = []

              // sort outcomes by lowest odds
              group.betOffers.forEach((offer, idx) => {
                const offerType = offer.description
                if (offerType.toLowerCase() === 'winner') {
                  winnerOdds = this.sortByLowestOdds(group.betOffers[idx].outcomes)
                } else if (offerType.toLowerCase() === 'top 2') {
                  runnerUpOdds = this.sortByLowestOdds(group.betOffers[idx].outcomes, winnerOdds)
                }
              })
              
              // get participant names from runnerUpOdds as it will contain more participants longer
              const groupParticipants = runnerUpOdds.map(participant => participant.englishLabel)

              return (
              <GroupList key={group.event.id}>
                 {
                   runnerUpOdds.map((item, idx) => {
                    let flagUrl = null
                    const participant = groupParticipants[idx]
                    const outcomes = this.matchOutcomesByParticipant(item, winnerOdds)
                    if (group.event.groupId === WORLD_CUP_2018_ID) {
                      flagUrl = this.generateCountryFlagUrl(participant)
                    }
                    return (
                      <GroupListItem
                        key={item.id}
                        participant={participant}
                        flagUrl={flagUrl}
                        outcomes={outcomes}
                        handleClick={() => this.handleListItemClick(group)}
                      />
                    )})
                  }                   
              </GroupList>
            )})
          }
        </TabPagination>
      </div>
    )
  }
}

GroupWidget.defaultProps = {
  selected: 0,
}

GroupWidget.propTypes = {
  /**
   * Tournament groups array (event entities)
   */
  groups: PropTypes.array.isRequired,

  /**
   * Widget's title
   */
  title: PropTypes.string.isRequired,

  /**
   * Widget's tag line
   */
  tagline: PropTypes.string.isRequired,

  /**
   * Selected group index (default to 0)
   */
  selected: PropTypes.number,
  backgroundUrl: PropTypes.string.isRequired
}

export default GroupWidget