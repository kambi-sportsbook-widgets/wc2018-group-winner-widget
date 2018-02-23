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

  formatData(data) {
    return data.reduce((arr, group) => {
      const groupOutcomes = {
        event: group.event,
        groupName: group.groupName,
        betOffers: []
      }
      let countries = 0
      while (countries < group.betOffers[0].outcomes.length) {
        groupOutcomes.betOffers.push([])
        countries ++
      }
    
      group.betOffers.forEach(offer => {
        offer.outcomes.forEach((outcome, idx) => {
          groupOutcomes.betOffers[idx].push(outcome)
        })	
      })
      arr.push(groupOutcomes)
      return arr
    }, [])
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

    const formattedData = this.formatData(groups)

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
            formattedData.map(group => (
              <GroupList key={group.event.id}>
                {
                  group.betOffers.map(offer => {
                    let flagUrl = null
                    const participant = offer[0].label.split('(')[0]
                    const countrySplit = offer[0].englishLabel.split('(')
                    
                    if (countrySplit && countrySplit.length > 1 && group.event.groupId === WORLD_CUP_2018_ID) {
                      flagUrl = this.generateCountryFlagUrl(countrySplit[1].slice(0, countrySplit[1].length -1))
                    } else if (group.event.groupId === WORLD_CUP_2018_ID) {
                      flagUrl = this.generateCountryFlagUrl(countrySplit[0])
                    }

                    return (
                      <GroupListItem
                        key={offer[0].participantId}
                        participant={participant}
                        flagUrl={flagUrl}
                        outcomes={offer}
                        handleClick={() => this.handleListItemClick(group)}
                      />
                    )
                  })
                }
              </GroupList>
            ))
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