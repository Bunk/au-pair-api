import "babel-polyfill";
import request from "request-promise";

function defaultResponseTransform( response ) {
  const status = response.statusCode >= 200 && response.statusCode < 300; // eslint-disable-line no-magic-numbers
  return {
    healthy: status,
    error: status ? undefined : response.body
  };
}

class ApiStrategy {
  constructor( { uri, transforms = {} } = {} ) {
    this.uri = uri;
    this.transforms = transforms;
  }

  async check() {
    // TODO: Add validation on this stuff
    let options = { uri: this.uri, resolveWithFullResponse: true, simple: false, json: true };

    if ( this.transforms.request ) {
      options = this.transforms.request( options );
    }

    let response = await request( options );
    return ( this.transforms.response || defaultResponseTransform )( response );
  }
}

export default ApiStrategy;
