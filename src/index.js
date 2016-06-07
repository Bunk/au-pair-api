import request from "request-promise";
import validator from "./validation";

function defaultResponseTransform( response ) {
  const status = response.statusCode >= 200 && response.statusCode < 300; // eslint-disable-line no-magic-numbers
  return {
    healthy: status,
    degraded: false,
    error: status ? undefined : new Error( response.body ),
    message: status ? undefined : response.body
  };
}

class ApiStrategy {
  constructor( { name, uri, transforms = {} } ) {
    validator.validate( { name, uri, transforms } );

    this.name = name;
    this.uri = uri;
    this.transforms = transforms;
  }

  async check() {
    let options = { uri: this.uri, resolveWithFullResponse: true, simple: false, json: true };

    if ( this.transforms.request ) {
      options = this.transforms.request( options );
    }

    let response = await request( options );
    let transformed = ( this.transforms.response || defaultResponseTransform )( response );
    return transformed;
  }
}

export default ApiStrategy;
