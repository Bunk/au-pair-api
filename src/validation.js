import joi from "joi";

const validator = joi.object( {
  name: joi.string(),
  uri: joi.string().uri(),
  transforms: joi.object( {
    request: joi.func().arity( 1 ),
    response: joi.func().arity( 1 )
  } )
} ).requiredKeys( "name", "uri" );

export default {
  validate( obj ) {
    return joi.assert( obj, validator );
  }
};
