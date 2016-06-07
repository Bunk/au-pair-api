import request from "request-promise";
import validator from "./validation";

function defaultResponseTransform( response ) {
  const status = response.statusCode >= 200 && response.statusCode < 300; // eslint-disable-line no-magic-numbers
  return {
    healthy: status,
    error: status ? undefined : response.body
  };
}

class ApiStrategy {
  constructor( { name, uri, transforms = {} } ) {
    validator.validate( { name, uri, transforms } );

    this.name = name;
    this.uri = uri;
    this.transforms = transforms;
  }

  check() {
    let options = { uri: this.uri, resolveWithFullResponse: true, simple: false, json: true };

    if ( this.transforms.request ) {
      options = this.transforms.request( options );
    }

    return request( options )
      .then( response => ( this.transforms.response || defaultResponseTransform )( response ) );
  }
}

export default ApiStrategy;
