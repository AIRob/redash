import { find } from 'lodash';
import queryStringParameters from '@/services/query-string';
import logoUrl from '@/assets/images/redash_icon_small.png';
import template from './visualization-embed.html';
import notification from '@/services/notification';

const VisualizationEmbed = {
  template,
  controller($http, $q, $routeParams, Auth, Query, QueryResult) {
    'ngInject';

    document.querySelector('body').classList.add('headless');
    const visualizationId = parseInt($routeParams.visualizationId, 10);
    this.showQueryDescription = $routeParams.showDescription;
    this.logoUrl = logoUrl;

    this.apiKey = $routeParams.api_key;
    Auth.setApiKey(this.apiKey);
    Auth.loadConfig().then(() => {
      const queryId = $routeParams.queryId;

      const query = $http.get(`api/queries/${queryId}`).then(response => response.data);
      const queryResult = $http.post(`api/queries/${queryId}/results`, {
        parameters: queryStringParameters(),
      }).then(response => response.data, (error) => {
        if (error.status === 400) {
          return {};
        }

        notification.error('Could Not Load Query Results', error.statusText, { duration: 60 });
      });

      $q.all([query, queryResult]).then((data) => {
        this.query = new Query(data[0]);
        this.queryResult = new QueryResult(data[1]);
        this.visualization =
          find(this.query.visualizations, visualization => visualization.id === visualizationId);
      });
    });
  },
};

export default function init(ngModule) {
  ngModule.component('visualizationEmbed', VisualizationEmbed);

  ngModule.config(($routeProvider) => {
    $routeProvider.when('/embed/query/:queryId/visualization/:visualizationId', {
      template: '<visualization-embed></visualization-embed>',
    });
  });
}

init.init = true;
