import {
   coreLibrary,
   eventsModule,
   widgetModule,
 } from 'kambi-widget-core-library'
 import kambi from './Services/kambi'
 import Widget from './Widget'
 
 /**
  * Removes widget on fatal errors.
  * @param {Error} error Error instance
  */
 const onFatal = function(error) {
   console.error(error)
   widgetModule.removeWidget()
 }
 
 coreLibrary
   .init({
     widgetTrackingName: 'wc2018-group-winner',
     filter: "/football/world_cup_2018",
     criterionId: 1004240933,
     pollingInterval: 30000,
     pollingCount: 4,
     eventsRefreshInterval: 120000,
   })
   .then(() => {
     const { 
       filter, // filter not used as we want to hardcode wc2018
       eventsRefreshInterval,
       pollingCount,
       backgroundUrl,
       iconUrl,
       criterionId,
       pollingInterval,
       title,
       tagline
     } = coreLibrary.args 
 
     eventsModule.liveEventPollingInterval = pollingInterval    
     const widget = new Widget({
       filter,
       criterionId,
       title,
       tagline,
       eventsRefreshInterval,
       pollingCount,
       onFatal,
       backgroundUrl,
       iconUrl
     })
 
     return widget.init()
   })
   .catch(onFatal)